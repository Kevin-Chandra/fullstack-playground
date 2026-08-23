import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagePublication } from "../libs/entity/page-publication.entity";
import { PageSectionModule } from "../page-section/page-section.module";
import { PageModule } from "../page/page.module";
import { StorageModule } from "../storage/storage.module";
import { UserModule } from "../user/user.module";
import { PagePublicationController } from "./page-publication.controller";
import { PagePublicationService } from "./page-publication.service";

/**
 * Depends on `page-section` to snapshot and restore the draft. That edge only
 * points this way; media garbage collection, which both sides need, lives in
 * `PageModule` precisely so this does not become a cycle.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PagePublication]),
    PageModule,
    PageSectionModule,
    StorageModule,
    UserModule,
  ],
  controllers: [PagePublicationController],
  providers: [PagePublicationService],
})
export class PagePublicationModule {}
