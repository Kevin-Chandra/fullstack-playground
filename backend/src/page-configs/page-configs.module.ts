import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagePublication } from "../libs/entity/page-publication.entity";
import { PageSection } from "../libs/entity/page-section.entity";
import { PageModule } from "../page/page.module";
import { StorageModule } from "../storage/storage.module";
import { PageConfigsController } from "./page-configs.controller";
import { PageConfigsService } from "./page-configs.service";

/**
 * Exports `PageConfigsService` because `page-publication` reads the draft to
 * snapshot it. That dependency only ever points one way — this module must
 * never import `page-publication`, which is why discard reads the publication
 * *entity* here rather than borrowing that module's service.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PageSection, PagePublication]),
    PageModule,
    StorageModule,
  ],
  controllers: [PageConfigsController],
  providers: [PageConfigsService],
  exports: [PageConfigsService],
})
export class PageConfigsModule {}
