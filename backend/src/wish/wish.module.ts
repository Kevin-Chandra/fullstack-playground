import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GuestModule } from "../guest/guest.module";
import { Wish } from "../libs/entity/wish.entity";
import { StorageModule } from "../storage/storage.module";
import { WishController } from "./wish.controller";
import { WishService } from "./wish.service";

@Module({
  imports: [TypeOrmModule.forFeature([Wish]), GuestModule, StorageModule],
  controllers: [WishController],
  providers: [WishService],
})
export class WishModule {}
