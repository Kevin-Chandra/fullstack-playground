import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Media } from "../libs/entity/media.entity";
import { PageModule } from "../page/page.module";
import { StorageModule } from "../storage/storage.module";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
  // PageModule for `PageMediaService`: a delete has to see every reference to
  // the key, and only that service can.
  imports: [TypeOrmModule.forFeature([Media]), StorageModule, PageModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
