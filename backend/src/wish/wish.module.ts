import { Module } from "@nestjs/common";
import { WishService } from "./wish.service";
import { WishController } from "./wish.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Wish } from "../libs/entity/wish.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Wish])],
  controllers: [WishController],
  providers: [WishService],
})
export class WishModule {}
