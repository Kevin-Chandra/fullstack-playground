import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { isDeepStrictEqual } from "node:util";
import { DataSource, EntityManager, Repository } from "typeorm";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { paginationConstants } from "../libs/constants/pagination.constants";
import {
  PagePublication,
  PublishedSection,
} from "../libs/entity/page-publication.entity";
import { Page } from "../libs/entity/page.entity";
import { User } from "../libs/entity/user.entity";
import { resolveMediaRefs } from "../libs/utils/media-ref.util";
import { PaginationUtil } from "../libs/utils/pagination.util";
import { PageConfigsService } from "../page-configs/page-configs.service";
import { PageService } from "../page/page.service";
import { StorageService } from "../storage/storage.service";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { PagePublicationListItem } from "./dto/page-publication-response.dto";
import { PublishedSectionResponse } from "./dto/published-section-response.dto";

/**
 * Everything about what is live, and how the draft compares to it.
 *
 * Publications are append-only: the live page is always the newest row, and
 * rollback inserts a copy rather than rewriting history.
 *
 * History is never trimmed, so every snapshot is kept indefinitely. One
 * consequence worth knowing: an image referenced by any publication stays
 * referenced forever, so published media is never collected from storage —
 * only draft edits and discard release anything.
 */
@Injectable()
export class PagePublicationService {
  constructor(
    @InjectRepository(PagePublication)
    private readonly publicationRepository: Repository<PagePublication>,

    private readonly pageService: PageService,

    private readonly pageConfigsService: PageConfigsService,

    private readonly storageService: StorageService,

    private readonly dataSource: DataSource,
  ) {}

  async findLive(slug: string): Promise<PublishedSectionResponse[]> {
    const page = await this.pageService.findBySlugOrFail(slug);
    const publication = await this.findNewest(page.id);

    return this.toPublicResponse(publication?.sections ?? []);
  }

  async preview(slug: string): Promise<PublishedSectionResponse[]> {
    const page = await this.pageService.findBySlugOrFail(slug);

    return this.toPublicResponse(
      await this.pageConfigsService.projectToSnapshot(page.id),
    );
  }

  async publicationPreview(
    slug: string,
    publicationId: number,
  ): Promise<PublishedSectionResponse[]> {
    const page = await this.pageService.findBySlugOrFail(slug);
    const publication = await this.publicationRepository.findOneBy({
      id: publicationId,
      pageId: page.id,
    });

    if (!publication) {
      throw new NotFoundException(
        `Publication ${publicationId} not found for page "${slug}".`,
        { description: errorCodeConstants.PUBLICATION_NOT_FOUND },
      );
    }

    return this.toPublicResponse(publication.sections);
  }

  /**
   * Appends the draft as the newest publication.
   *
   * The whole decision runs inside one transaction, holding the page row: read
   * the draft, compare it to what is live, number the new row. Unlocked, two
   * publishes fired at once (a double-clicked button, two open tabs) both read
   * the same newest version and both write it, and both pass the "nothing new"
   * guard that exists to stop exactly that.
   */
  async publish(
    slug: string,
    createPublicationDto: CreatePublicationDto,
    publishedBy: number,
  ): Promise<PagePublication> {
    const page = await this.pageService.findBySlugOrFail(slug);

    return this.dataSource.transaction(async (manager) => {
      await this.lockPage(manager, page.id);

      // Read after the lock: a save that was in flight has either committed
      // before it, or is waiting behind it.
      const [draft, newest] = await Promise.all([
        this.pageConfigsService.projectToSnapshot(page.id),
        this.findNewest(page.id, manager),
      ]);

      // Keeps history free of snapshots identical to the one already live.
      if (!this.differs(draft, newest?.sections)) {
        throw new ConflictException("There is nothing new to publish.", {
          description: errorCodeConstants.NO_UNPUBLISHED_CHANGES,
        });
      }

      return this.saveNewPublication(
        manager,
        page,
        publishedBy,
        createPublicationDto.description,
        draft,
      );
    });
  }

  /**
   * The page's publication history, newest first.
   *
   * Ordered by `id`, not `publishedAt`: `findNewest` decides what is *live* by
   * id, and two publications a millisecond apart tie on the timestamp — so
   * sorting by it could put a row at the top of the history that is not the one
   * being served. `id` is monotonic and covered by the `(pageId, id)` index.
   *
   * Paginated because history is never trimmed: an unbounded list grows with
   * every publish, forever.
   *
   * `isLive` is resolved against the newest id rather than the row's position,
   * so it stays correct on any page and under any sort the caller asks for.
   */
  async listPublications(
    slug: string,
    query: PaginateQuery,
  ): Promise<Paginated<PagePublicationListItem>> {
    const page = await this.pageService.findBySlugOrFail(slug);

    const [result, live] = await Promise.all([
      paginate(query, this.publicationRepository, {
        select: [
          "id",
          "version",
          "description",
          "publishedAt",
          "publishedBy.id",
          "publishedBy.name",
        ],
        relations: { publishedBy: true },
        where: { pageId: page.id },
        defaultLimit: paginationConstants.ITEM_PER_PAGE,
        maxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
        sortableColumns: ["id", "version", "publishedAt"],
        defaultSortBy: [["id", "DESC"]],
      }),
      this.findNewestId(page.id),
    ]);

    PaginationUtil.assertPageInRange(query, result);

    return {
      ...result,
      data: result.data.map((publication) => ({
        ...publication,
        isLive: publication.id === live?.id,
      })),
    } as unknown as Paginated<PagePublicationListItem>;
  }

  /**
   * Republishes an earlier snapshot by appending it as a new publication.
   *
   * The draft is deliberately left alone: rollback changes what visitors see,
   * never the editor's work in progress. `hasUnpublishedChanges` will then
   * report the difference honestly, and *discard* is the way to match them up.
   */
  async rollback(
    slug: string,
    publicationId: number,
    publishedBy: number,
  ): Promise<PagePublication> {
    const page = await this.pageService.findBySlugOrFail(slug);
    const source = await this.publicationRepository.findOneBy({
      id: publicationId,
      pageId: page.id,
    });

    if (!source) {
      throw new NotFoundException(
        `Publication ${publicationId} not found for page "${slug}".`,
        { description: errorCodeConstants.PUBLICATION_NOT_FOUND },
      );
    }

    return this.dataSource.transaction(async (manager) => {
      await this.lockPage(manager, page.id);

      return this.saveNewPublication(
        manager,
        page,
        publishedBy,
        `Rolled back from version ${source.version}`,
        source.sections,
      );
    });
  }

  /**
   * Serialises writers on one page.
   *
   * Publishing is a read-then-insert — read the newest version, add one, write
   * — which is only safe if nobody else is doing it at the same time. The page
   * row is the token for that, the same one `PageConfigsService.save` takes.
   */
  private async lockPage(
    manager: EntityManager,
    pageId: number,
  ): Promise<void> {
    await manager.findOne(Page, {
      where: { id: pageId },
      lock: { mode: "pessimistic_write" },
    });
  }

  private async saveNewPublication(
    manager: EntityManager,
    page: Page,
    publishedBy: number,
    description: string,
    draft: PublishedSection[],
  ): Promise<PagePublication> {
    const [author, newest] = await Promise.all([
      this.findAuthor(manager, publishedBy),
      this.findNewest(page.id, manager),
    ]);
    const version = (newest?.version ?? 0) + 1;

    return manager.save(
      manager.create(PagePublication, {
        pageId: page.id,
        sections: draft,
        version: version,
        description: description,
        publishedBy: author,
      }),
    );
  }

  private async findAuthor(
    manager: EntityManager,
    userId: number,
  ): Promise<User | null> {
    return manager.findOne(User, {
      where: { id: userId },
      select: { id: true },
    });
  }

  /** The live publication's id, without dragging its snapshot along. */
  private findNewestId(pageId: number): Promise<PagePublication | null> {
    return this.publicationRepository.findOne({
      where: { pageId },
      order: { id: "DESC" },
      select: { id: true },
    });
  }

  private findNewest(
    pageId: number,
    manager?: EntityManager,
  ): Promise<PagePublication | null> {
    const options = {
      where: { pageId },
      order: { id: "DESC" as const },
    };

    return manager
      ? manager.findOne(PagePublication, options)
      : this.publicationRepository.findOne(options);
  }

  private differs(draft: PublishedSection[], published?: PublishedSection[]) {
    return !isDeepStrictEqual(draft, published ?? []);
  }

  private toPublicResponse(
    sections: PublishedSection[],
  ): PublishedSectionResponse[] {
    return [...sections]
      .filter((section) => section.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((section, index) => ({
        type: section.type,
        sortOrder: index,
        data: resolveMediaRefs(section.data, (key) =>
          this.storageService.getPublicUrl(key),
        ),
      }));
  }
}
