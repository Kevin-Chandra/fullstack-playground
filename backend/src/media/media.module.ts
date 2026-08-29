import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Media } from "../libs/entity/media.entity";
import { StorageModule } from "../storage/storage.module";
import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";

@Module({
  imports: [TypeOrmModule.forFeature([Media]), StorageModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
