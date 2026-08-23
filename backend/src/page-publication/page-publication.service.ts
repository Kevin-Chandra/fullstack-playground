import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isDeepStrictEqual } from "node:util";
import { Repository } from "typeorm";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import {
  PagePublication,
  PublishedSection,
} from "../libs/entity/page-publication.entity";
import { Page } from "../libs/entity/page.entity";
import {
  collectMediaKeys,
  resolveMediaRefs,
} from "../libs/utils/media-ref.util";
import { PageSectionService } from "../page-section/page-section.service";
import { PageMediaService } from "../page/page-media.service";
import { PageService } from "../page/page.service";
import { StorageService } from "../storage/storage.service";
import { UserService } from "../user/user.service";
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

    private readonly pageSectionService: PageSectionService,

    private readonly pageMediaService: PageMediaService,

    private readonly storageService: StorageService,

    private readonly userService: UserService,
  ) {}

  async findLive(slug: string): Promise<PublishedSectionResponse[]> {
    const page = await this.pageService.findBySlugOrFail(slug);
    const publication = await this.findNewest(page.id);

    return this.toPublicResponse(publication?.sections ?? []);
  }

  async preview(slug: string): Promise<PublishedSectionResponse[]> {
    const page = await this.pageService.findBySlugOrFail(slug);

    return this.toPublicResponse(
      await this.pageSectionService.projectToSnapshot(page.id),
    );
  }

  async publicationPreview(
    publicationId: number,
  ): Promise<PublishedSectionResponse[]> {
    const publication = await this.publicationRepository.findOneBy({
      id: publicationId,
    });

    if (!publication) {
      throw new NotFoundException("Publication not found");
    }

    return this.toPublicResponse(publication.sections);
  }

  /**
   * How the draft compares to what is live, without shipping either payload.
   *
   * Shares `differs` with {@link publish}, so the editor's Publish button and
   * the no-op rejection can never disagree about whether there are changes.
   */
  // async status(slug: string): Promise<PageStatusResponse> {
  //   const page = await this.pageService.findBySlugOrFail(slug);
  //   const [draft, publication] = await Promise.all([
  //     this.pageSectionService.projectToSnapshot(page.id),
  //     this.findNewest(page.id),
  //   ]);

  //   return {
  //     hasUnpublishedChanges: this.differs(draft, publication?.sections),
  //     lastPublishedAt: publication?.publishedAt ?? null,
  //     publicationId: publication?.id ?? null,
  //     draftSectionCount: draft.length,
  //   };
  // }

  async publish(
    slug: string,
    createPublicationDto: CreatePublicationDto,
    publishedBy: number,
  ): Promise<PagePublication> {
    const page = await this.pageService.findBySlugOrFail(slug);
    const [draft, newest] = await Promise.all([
      this.pageSectionService.projectToSnapshot(page.id),
      this.findNewest(page.id),
    ]);

    // Keeps history free of snapshots identical to the one already live.
    if (!this.differs(draft, newest?.sections)) {
      throw new ConflictException("There is nothing new to publish.", {
        description: errorCodeConstants.NO_UNPUBLISHED_CHANGES,
      });
    }

    let version: number = 1;
    if (newest) {
      const latestVersion = newest.version;
      version = latestVersion + 1;
    }

    const publication = await this.saveNewPublication(
      page,
      publishedBy,
      createPublicationDto.description,
      version,
      draft,
    );

    return publication;
  }

  /**
   * Throws the draft away and restores it from what is live.
   *
   * Images that only ever existed in the discarded draft become unreferenced
   * here, which is the one place they are expected to be collected.
   */
  async discard(slug: string): Promise<PublishedSectionResponse[]> {
    const page = await this.pageService.findBySlugOrFail(slug);
    const [draft, newest] = await Promise.all([
      this.pageSectionService.projectToSnapshot(page.id),
      this.findNewest(page.id),
    ]);

    const discardedKeys = collectMediaKeys(draft);

    await this.pageSectionService.replaceAllSections(
      page.id,
      newest?.sections ?? [],
    );
    await this.pageMediaService.pruneUnreferenced(discardedKeys);

    return this.toPublicResponse(newest?.sections ?? []);
  }

  async listPublications(slug: string): Promise<PagePublicationListItem[]> {
    const page = await this.pageService.findBySlugOrFail(slug);

    const publications = await this.publicationRepository
      .createQueryBuilder("publication")
      .leftJoin("publication.publishedBy", "user")
      .select([
        "publication.id",
        "publication.version",
        "publication.description",
        "publication.publishedAt",
        "user.id",
        "user.name",
      ])
      .where("publication.pageId = :pageId", { pageId: page.id })
      .orderBy("publication.publishedAt", "DESC")
      .getMany();

    return publications;
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

    const publication = await this.saveNewPublication(
      page,
      publishedBy,
      `Rolled back from version ${source.version}`,
      source.version + 1,
      source.sections,
    );

    return publication;
  }

  private async saveNewPublication(
    page: Page,
    publishedBy: number,
    description: string,
    version: number,
    draft: PublishedSection[],
  ): Promise<PagePublication> {
    const user = await this.userService.findOne(publishedBy);

    const publication = await this.publicationRepository.save(
      this.publicationRepository.create({
        pageId: page.id,
        sections: draft,
        version: version,
        description: description,
        publishedBy: user,
      }),
    );

    return publication;
  }

  private findNewest(pageId: number): Promise<PagePublication | null> {
    return this.publicationRepository.findOne({
      where: { pageId },
      order: { id: "DESC" },
    });
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
