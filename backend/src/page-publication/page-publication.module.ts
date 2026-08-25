import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PagePublication } from "../libs/entity/page-publication.entity";
import { PageConfigsModule } from "../page-configs/page-configs.module";
import { PageModule } from "../page/page.module";
import { StorageModule } from "../storage/storage.module";
import { PagePublicationController } from "./page-publication.controller";
import { PagePublicationService } from "./page-publication.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([PagePublication]),
    PageModule,
    PageConfigsModule,
    StorageModule,
  ],
  controllers: [PagePublicationController],
  providers: [PagePublicationService],
})
export class PagePublicationModule {}
