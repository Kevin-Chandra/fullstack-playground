import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagePublication } from "../libs/entity/page-publication.entity";
import { PageSection } from "../libs/entity/page-section.entity";
import { Page } from "../libs/entity/page.entity";
import { StorageModule } from "../storage/storage.module";
import { PageMediaService } from "./page-media.service";
import { PageController } from "./page.controller";
import { PageService } from "./page.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, PageSection, PagePublication]),
    StorageModule,
  ],
  controllers: [PageController],
  providers: [PageService, PageMediaService],
  exports: [PageService, PageMediaService],
})
export class PageModule {}
