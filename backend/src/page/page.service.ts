import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { DynamicPages } from "../libs/constants/page.constants";
import { PagePublication } from "../libs/entity/page-publication.entity";
import { Page } from "../libs/entity/page.entity";
import { PageDetailsResponse } from "./dto/page-details-response.dto";

@Injectable()
export class PageService implements OnModuleInit {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,

    @InjectRepository(PagePublication)
    private readonly publicationRepository: Repository<PagePublication>,
  ) {
    this.logger = new Logger("Page Service");
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.seed();
    } catch (error) {
      this.logger.error(
        "Failed to seed pages. Server-driven pages will be unavailable until the schema exists.",
        error,
      );
    }
  }

  findAll(): Promise<Page[]> {
    return this.pageRepository.find({ order: { id: "ASC" } });
  }

  async findPageDetails(slug: string): Promise<PageDetailsResponse> {
    const page = await this.pageRepository.findOneBy({ slug: slug });
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found`);
    }

    const publication = await this.publicationRepository.findOne({
      where: { pageId: page.id },
      order: { id: "DESC" },
      select: {
        id: true,
        version: true,
        description: true,
        publishedAt: true,
        publishedBy: { id: true, name: true },
      },
      relations: { publishedBy: true },
    });

    return {
      id: page.id,
      slug: page.slug,
      name: page.name,
      draftVersion: page.draftVersion,
      livePublication: publication
        ? {
            id: publication.id,
            version: publication.version,
            description: publication.description,
            publishedAt: publication.publishedAt,
            publishedBy: publication.publishedBy,
          }
        : null,
    };
  }

  async findBySlugOrFail(slug: string): Promise<Page> {
    const page = await this.pageRepository.findOneBy({ slug: slug });

    if (!page) {
      throw new NotFoundException(`Page "${slug}" not found.`, {
        description: errorCodeConstants.PAGE_NOT_FOUND,
      });
    }

    return page;
  }

  private async seed(): Promise<void> {
    for (const page of DynamicPages) {
      const existing = await this.pageRepository.findOneBy({ slug: page.slug });

      if (existing) {
        continue;
      }

      await this.pageRepository.save(this.pageRepository.create(page));
      this.logger.log(`Seeded page "${page.slug}".`);
    }
  }
}
