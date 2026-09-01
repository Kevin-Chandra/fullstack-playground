import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { DataSource, EntityManager, In, Repository } from "typeorm";
import * as z from "zod";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { SectionType } from "../libs/entity/enums/section-type.enum";
import {
  PagePublication,
  PublishedSection,
} from "../libs/entity/page-publication.entity";
import { PageSection } from "../libs/entity/page-section.entity";
import { Page } from "../libs/entity/page.entity";
import {
  collectMediaKeys,
  resolveMediaRefs,
} from "../libs/utils/media-ref.util";
import { PageMediaService } from "../page/page-media.service";
import { PageService } from "../page/page.service";
import { StorageService } from "../storage/storage.service";
import {
  PageConfigResponse,
  PageDraftResponse,
} from "./dto/page-config-response.dto";
import { PageConfigDto, PageSectionDto } from "./dto/page-config.dto";
import { getSectionDefinition } from "./schema/section-schema.registry";

/**
 * A page's draft, read and written whole.
 *
 * Nothing here touches the public site — the live page comes from the newest
 * publication. `save` is the editor's only write route: it takes the entire
 * draft and matches rows on their client-minted `uuid`, which is why positions
 * are assigned from the payload's order rather than repaired afterwards.
 * Everything stays scoped to one page — `sortOrder` is dense *within* a page
 * and singleton types are unique *within* a page, so a hero on `home` never
 * blocks a hero elsewhere.
 */
@Injectable()
export class PageConfigsService {
  constructor(
    @InjectRepository(PageSection)
    private readonly sectionRepository: Repository<PageSection>,

    @InjectRepository(PagePublication)
    private readonly publicationRepository: Repository<PagePublication>,

    private readonly pageService: PageService,

    private readonly pageMediaService: PageMediaService,

    private readonly storageService: StorageService,

    private readonly dataSource: DataSource,
  ) {}

  async findDraft(slug: string): Promise<PageDraftResponse> {
    const page = await this.pageService.findBySlugOrFail(slug);
    const sections = await this.findPageSections(page.id);

    return {
      draftVersion: page.draftVersion,
      sections: sections.map((section) => this.toResponse(section)),
    };
  }

  /**
   * Writes a page's whole draft in one request.
   *
   * The payload *is* the draft. Sections are matched on their client-minted
   * `uuid` — present means write, absent means gone — and the array's order
   * becomes `sortOrder` verbatim, which is why nothing here reindexes: dense
   * positions are assigned rather than repaired. Replaying the same body with a
   * current token is a no-op, so a retried save cannot double-insert.
   *
   * Because absence deletes, the payload must be built from the current draft:
   * `draftVersion` is checked under a row lock before anything is written, so
   * two editors saving at once serialise, and the second is told its copy is
   * stale instead of silently deleting the first's sections.
   */
  async save(slug: string, pageConfigDto: PageConfigDto): Promise<void> {
    const pageId = await this.resolvePageId(slug);

    this.assertSingletonsAppearOnce(pageConfigDto.sections);

    // Parsed before the transaction opens: one malformed section has to fail
    // the whole request without a single row being touched.
    const sections = this.parseSections(pageConfigDto.sections);

    const previousKeys = await this.dataSource.transaction(async (manager) => {
      await this.claimDraft(manager, pageId, pageConfigDto.draftVersion);

      // Holds the media rows this payload references for the rest of the
      // transaction, so a prune running concurrently cannot decide they are
      // orphaned and collect them between here and the commit.
      const unavailable = await this.pageMediaService.lockReferencedKeys(
        manager,
        sections.flatMap((section) => collectMediaKeys(section.data)),
      );

      if (unavailable.length > 0) {
        throw new ConflictException(
          `These files are no longer available: ${unavailable.join(", ")}.`,
          { description: errorCodeConstants.MEDIA_UNAVAILABLE },
        );
      }

      const [current, claimed] = await Promise.all([
        manager.find(PageSection, { where: { pageId } }),
        this.findClaimingRows(manager, sections),
      ]);

      // `uuid` is unique across every page, so a uuid already held elsewhere
      // cannot be inserted here. Checked up front to fail with the offending
      // uuids rather than a bare constraint violation.
      const foreign = claimed.filter(
        (row) => String(row.pageId) !== String(pageId),
      );

      if (foreign.length > 0) {
        throw new ConflictException(
          `These sections belong to another page: ${foreign
            .map((row) => row.uuid)
            .join(", ")}.`,
          errorCodeConstants.SECTION_UUID_TAKEN,
        );
      }

      const idByUuid = new Map<string, number>(
        current.map((row) => [row.uuid, row.id]),
      );
      const saved = new Set(sections.map((section) => section.uuid));

      // Absence is the delete signal, since the payload is the whole draft.
      // That also keeps deletes page-scoped for free: another page's rows are
      // never in `current`, so nothing outside this slug can be removed.
      const removed = current.filter((row) => !saved.has(row.uuid));

      if (removed.length > 0) {
        await manager.delete(
          PageSection,
          removed.map((row) => row.id),
        );
      }

      if (sections.length > 0) {
        await manager.save(
          sections.map((section, index) =>
            manager.create(PageSection, {
              // Absent for a section this page has not seen before, which is
              // what makes the write an insert rather than an update.
              id: idByUuid.get(section.uuid),
              pageId,
              uuid: section.uuid,
              type: section.type,
              data: section.data,
              isVisible: section.isVisible ?? true,
              sortOrder: index,
            }),
          ),
        );
      }

      // Every key the page held before this write is a *candidate*. Whether one
      // is really orphaned depends on the new draft and on retained
      // publications, and only `PageMediaService` can see both.
      return current.flatMap((row) => collectMediaKeys(row.data));
    });

    // Deliberately after the commit: the pruner counts references by reading
    // the tables, so it must not still see the rows this save replaced.
    await this.pageMediaService.pruneUnreferenced(previousKeys);
    return;
  }

  /**
   * Throws the draft away and restores it from what is live.
   *
   * Images that only ever existed in the discarded draft become unreferenced
   * here, which is the one place they are expected to be collected.
   */
  async discard(slug: string): Promise<void> {
    const page = await this.pageService.findBySlugOrFail(slug);
    const [draft, newest] = await Promise.all([
      this.projectToSnapshot(page.id),
      this.findNewestPublication(page.id),
    ]);

    if (!newest) {
      throw new NotFoundException("No latest publication published yet");
    }

    if (!newest.sections) {
      throw new NotFoundException("Latest publication has no data");
    }

    const discardedKeys = collectMediaKeys(draft);

    await this.replaceAllSections(page.id, newest.sections);

    // Deliberately after the rewrite, exactly as in `save`: the pruner counts
    // references by reading the tables, so it must not still see the rows
    // discard just replaced.
    await this.pageMediaService.pruneUnreferenced(discardedKeys);
    return;
  }

  /**
   * The draft projected into the shape a publication stores.
   *
   * Ids and timestamps are dropped on purpose: a snapshot is content, not rows.
   * Hidden sections are kept — the public read filters them, and discard needs
   * them to restore the editor's full working state.
   */
  async projectToSnapshot(pageId: number): Promise<PublishedSection[]> {
    const sections = await this.findPageSections(pageId);

    return sections.map((section) => ({
      type: section.type,
      sortOrder: Number(section.sortOrder),
      isVisible: section.isVisible,
      data: section.data,
    }));
  }

  /**
   * Swaps a page's entire draft for the given sections, in one transaction.
   *
   * Used by discard and only by discard. Row ids change, so callers must
   * refetch rather than reuse ids they already hold — and so do uuids: a
   * snapshot stores content, not identity, so each restored row is minted a
   * fresh one. `uuid` is NOT NULL, so leaving it unset fails the insert.
   *
   * The mint has to be canonical UUIDs, not the short base58 ids used for
   * user-facing handles elsewhere: the editor posts these uuids straight back
   * on its next save, where `PageSectionDto` validates them with `@IsUUID()`.
   *
   * `draftVersion` moves with the rewrite, so an editor holding the discarded
   * draft is refused on its next save rather than restoring it by accident.
   */
  async replaceAllSections(
    pageId: number,
    sections: PublishedSection[],
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.increment(Page, { id: pageId }, "draftVersion", 1);
      await manager.delete(PageSection, { pageId });

      const restored = [...sections]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((section, index) =>
          manager.create(PageSection, {
            pageId,
            uuid: randomUUID(),
            type: section.type,
            data: section.data,
            isVisible: section.isVisible,
            sortOrder: index,
          }),
        );

      if (restored.length > 0) {
        await manager.save(restored);
      }
    });
  }

  private findPageSections(pageId: number): Promise<PageSection[]> {
    return this.sectionRepository.find({
      where: { pageId },
      order: { sortOrder: "ASC" },
    });
  }

  /**
   * The live snapshot, read straight from the table rather than through
   * `page-publication` — that module imports this one, so the dependency
   * cannot point back without a cycle. Ordered by `id`, matching how
   * `PagePublicationService` picks the newest.
   */
  private findNewestPublication(
    pageId: number,
  ): Promise<PagePublication | null> {
    return this.publicationRepository.findOne({
      where: { pageId },
      order: { id: "DESC" },
    });
  }

  /**
   * Singleton types are counted in the payload rather than in the table,
   * because the payload is the entire draft — a second hero can only have come
   * from this request.
   */
  private assertSingletonsAppearOnce(sections: PageSectionDto[]): void {
    const counts = new Map<SectionType, number>();

    sections.forEach((section) =>
      counts.set(section.type, (counts.get(section.type) ?? 0) + 1),
    );

    const duplicated = [...counts]
      .filter(
        ([type, count]) => count > 1 && getSectionDefinition(type).singleton,
      )
      .map(([type]) => type);

    if (duplicated.length > 0) {
      throw new ConflictException(
        `These section types can only exist once on a page: ${duplicated.join(", ")}.`,
        { description: errorCodeConstants.SECTION_TYPE_ALREADY_EXISTS },
      );
    }
  }

  /**
   * The rows already holding any of the incoming uuids, across every page.
   *
   * Deliberately unscoped — the point is to catch a uuid that belongs to
   * someone else's page before trying to insert it here.
   */
  private async findClaimingRows(
    manager: EntityManager,
    sections: PageSectionDto[],
  ): Promise<PageSection[]> {
    if (sections.length === 0) {
      return [];
    }

    // The generic is pinned because `In` is declared as `FindOperator<any>`,
    // and that `any` otherwise leaks into the inferred row type.
    return manager.find<PageSection>(PageSection, {
      where: { uuid: In(sections.map((section) => section.uuid)) },
    });
  }

  private async resolvePageId(slug: string): Promise<number> {
    const page = await this.pageService.findBySlugOrFail(slug);

    return page.id;
  }

  /**
   * Takes the draft for this write, or refuses if the caller is behind.
   *
   * The row lock is what makes the check worth anything: without it two saves
   * can both read version 4 and both pass. Holding it until the transaction
   * commits serialises writers on the page, so the loser reads 5 and is turned
   * away rather than deleting the winner's sections.
   */
  private async claimDraft(
    manager: EntityManager,
    pageId: number,
    expectedVersion: number,
  ): Promise<void> {
    const page = await manager.findOne(Page, {
      where: { id: pageId },
      lock: { mode: "pessimistic_write" },
    });

    if (!page) {
      throw new NotFoundException(`Page ${pageId} not found.`, {
        description: errorCodeConstants.PAGE_NOT_FOUND,
      });
    }

    if (page.draftVersion !== expectedVersion) {
      throw new ConflictException(
        "This draft has changed since it was opened. Reload before saving.",
        { description: errorCodeConstants.DRAFT_OUT_OF_DATE },
      );
    }

    await manager.update(Page, pageId, { draftVersion: page.draftVersion + 1 });
  }

  /**
   * Validates every section against the schema for its *incoming* type and
   * returns the sections carrying the parsed payloads.
   *
   * Persisting the parsed value rather than the input is what keeps stray
   * fields out of the jsonb column, and what lets the editor send back a
   * payload it just fetched, response-only `url` fields and all.
   *
   * Failures are reported together. A bulk save that surfaced one broken
   * section at a time would cost the editor as many round trips as it has
   * mistakes, and it would have already been told about the first one.
   */
  private parseSections(sections: PageSectionDto[]): PageSectionDto[] {
    const parsed: PageSectionDto[] = [];
    const failures: string[] = [];

    sections.forEach((section, index) => {
      const result = getSectionDefinition(section.type).schema.safeParse(
        section.data,
      );

      if (!result.success) {
        failures.push(
          `  sections[${index}] (${section.type} ${section.uuid}):\n${this.formatIssues(result.error)}`,
        );

        return;
      }

      parsed.push({
        ...section,
        data: result.data as Record<string, unknown>,
      });
    });

    if (failures.length > 0) {
      throw new BadRequestException(
        `Invalid section payloads:\n${failures.join("\n")}`,
        { description: errorCodeConstants.SECTION_PAYLOAD_INVALID },
      );
    }

    return parsed;
  }

  private formatIssues(error: z.ZodError): string {
    return error.issues
      .map(
        (issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
      )
      .join("\n");
  }

  private toResponse(section: PageSection): PageConfigResponse {
    return {
      id: section.id,
      uuid: section.uuid,
      type: section.type,
      sortOrder: section.sortOrder,
      isVisible: section.isVisible,
      data: resolveMediaRefs(section.data, (key) =>
        this.storageService.getPublicUrl(key),
      ),
    };
  }
}
