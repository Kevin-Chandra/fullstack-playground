import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  LessThan,
  Repository,
} from "typeorm";
import { MediaCollection } from "../libs/constants/file.constants";
import { Media } from "../libs/entity/media.entity";
import { StorageService } from "../storage/storage.service";

/**
 * Which of the given keys something still points at.
 *
 * The predicate runs in Postgres, in one statement, and only the matched keys
 * come back. It used to be the other way round: every section row and every
 * publication snapshot was pulled into Node and walked in JS, so one
 * keystroke-driven draft save got slower with every publish anyone had ever
 * made, without bound.
 *
 * `$.** ? (@.key == "...")` matches a media ref at any depth, arrays included,
 * and only a `key` *member* — never a substring, never a field of that name.
 * The key goes through `to_json`, which escapes it, and `@?` against a literal
 * jsonpath is what lets the GIN indexes on `page_sections.data` and
 * `page_publications.sections` serve the lookup — both declared on their
 * entities, so a migration creates them.
 */
const REFERENCED_KEYS_SQL = `
  SELECT c.key
    FROM unnest($1::text[]) AS c(key)
   WHERE EXISTS (
           SELECT 1
             FROM page_sections s
            WHERE s.data @? ('$.** ? (@.key == ' || to_json(c.key)::text || ')')::jsonpath
         )
      OR EXISTS (
           SELECT 1
             FROM page_publications p
            WHERE p.sections @? ('$.** ? (@.key == ' || to_json(c.key)::text || ')')::jsonpath
         )`;

@Injectable()
export class PageMediaService {
  private readonly logger = new Logger(PageMediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    private readonly storageService: StorageService,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Collects the given objects, plus any abandoned upload, unless something
   * still points at them.
   *
   * Two ways a key survives: a duplicated section shares it, or — far more
   * important — a **retained publication** references it. Removing an image
   * from a draft must never delete the file the live page is still serving,
   * and rollback has to keep working for the whole history window.
   *
   * Only objects with a `media` row are ever deleted. That is deliberate: a key
   * this service has no record of belongs to something it cannot see the
   * references of, and guessing there would mean deleting another module's
   * files.
   */
  async pruneUnreferenced(candidateKeys: string[]): Promise<void> {
    const abandoned = await this.findAbandonedUploads();

    await this.collectUnreferenced([
      ...new Set([...candidateKeys, ...abandoned]),
    ]);
  }

  /**
   * Collects exactly the given keys that nothing points at, and reports which
   * ones went. Unlike {@link pruneUnreferenced} it sweeps nothing else in, so a
   * caller acting on one key can tell whether that key was the one collected.
   *
   * A key missing from the returned list survived for one of three reasons: a
   * draft or a retained publication still references it, it was already
   * collected, or this service has no record of it at all. All three mean the
   * same thing to a caller — the object is still there and must stay.
   */
  async collectUnreferenced(candidates: string[]): Promise<string[]> {
    if (candidates.length === 0) {
      return [];
    }

    const collected = await this.dataSource.transaction(async (manager) => {
      // Locked before the references are read, and held to commit. `save`
      // takes the same locks before storing a reference, so the two serialise
      // and this check cannot go stale under a concurrent write.
      const recorded = await manager.find(Media, {
        where: { key: In(candidates), deletedFromStorageAt: IsNull() },
        lock: { mode: "pessimistic_write" },
      });

      if (recorded.length === 0) {
        return [];
      }

      const referenced = await this.findReferencedKeys(
        manager,
        recorded.map((media) => media.key),
      );
      const orphans = recorded.filter((media) => !referenced.has(media.key));

      if (orphans.length > 0) {
        await manager.update(
          Media,
          orphans.map((media) => media.id),
          { deletedFromStorageAt: new Date() },
        );
      }

      return orphans.map((media) => media.key);
    });

    // After the commit, so the tombstone is durable first. A crash in between
    // leaves an object nobody references — wasteful, but recoverable, which is
    // the opposite of deleting one a committed row still points at.
    await Promise.all(
      collected.map((key) =>
        this.storageService.remove(key).catch((error: unknown) => {
          this.logger.error(`Failed to collect object ${key}`, error);
        }),
      ),
    );

    return collected;
  }

  /**
   * Keys a save is about to reference, locked so a prune running at the same
   * time cannot collect them out from under it.
   *
   * Returns the keys that are no longer available — collected, or never
   * recorded at all is *not* one of them: an unrecorded key is left to its
   * owner, exactly as `pruneUnreferenced` leaves it alone.
   */
  async lockReferencedKeys(
    manager: EntityManager,
    keys: string[],
  ): Promise<string[]> {
    if (keys.length === 0) {
      return [];
    }

    const recorded = await manager.find(Media, {
      where: { key: In(keys) },
      lock: { mode: "pessimistic_write" },
    });

    return recorded
      .filter((media) => media.deletedFromStorageAt !== null)
      .map((media) => media.key);
  }

  /**
   * Uploads old enough to count as abandoned, and not already collected.
   *
   * Recorded but referenced by nothing is the whole point: those keys were
   * never in any draft, so no other candidate list can reach them.
   */
  private async findAbandonedUploads(): Promise<string[]> {
    const cutoff = new Date(Date.now() - MediaCollection.UPLOAD_GRACE_MS);

    const stale = await this.mediaRepository.find({
      where: { deletedFromStorageAt: IsNull(), createdAt: LessThan(cutoff) },
      select: { id: true, key: true },
    });

    return stale.map((media) => media.key);
  }

  /**
   * Every one of `keys` that something still points at, across every page.
   *
   * Deliberately not scoped to one page — nothing stops the same object being
   * reused elsewhere, and collecting it because *this* page stopped using it
   * would break the other.
   */
  private async findReferencedKeys(
    manager: EntityManager,
    keys: string[],
  ): Promise<Set<string>> {
    const rows = await manager.query<{ key: string }[]>(REFERENCED_KEYS_SQL, [
      keys,
    ]);

    return new Set(rows.map((row) => row.key));
  }
}
