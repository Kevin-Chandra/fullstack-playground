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
import { Page } from "../libs/entity/page.entity";

@Injectable()
export class PageService implements OnModuleInit {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
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

  async findPageDetails(id: number): Promise<Page> {
    return this.pageRepository.findOneBy({ id: id });
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
