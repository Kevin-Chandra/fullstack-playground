import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
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
 * jsonpath is what lets the GIN indexes serve the lookup.
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

/**
 * The indexes that predicate relies on. Created at boot because the schema
 * follows the entity files (`synchronize`) and TypeORM cannot declare a GIN
 * index, so there is nowhere else to put them.
 */
const REFERENCE_INDEX_SQL = [
  `CREATE INDEX IF NOT EXISTS page_sections_data_gin ON page_sections USING gin (data)`,
  `CREATE INDEX IF NOT EXISTS page_publications_sections_gin ON page_publications USING gin (sections)`,
];

@Injectable()
export class PageMediaService implements OnModuleInit {
  private readonly logger = new Logger(PageMediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    private readonly storageService: StorageService,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Adds the GIN indexes the reference lookup relies on.
   *
   * Failure is logged rather than thrown: without them the same query still
   * returns the right answer, just by scanning.
   */
  async onModuleInit(): Promise<void> {
    for (const statement of REFERENCE_INDEX_SQL) {
      try {
        await this.dataSource.query(statement);
      } catch (error) {
        this.logger.error(
          "Failed to create a media reference index; pruning will scan instead.",
          error,
        );
      }
    }
  }

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
    const candidates = [...new Set([...candidateKeys, ...abandoned])];

    if (candidates.length === 0) {
      return;
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
