import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { PaginateQuery } from "nestjs-paginate";
import { Paginate } from "nestjs-paginate";
import { Public } from "../decorators/public.decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { CreateWishDto } from "./dto/create-wish.dto";
import { WishService } from "./wish.service";

@UseGuards(JwtGuard)
@Controller("wish")
export class WishController {
  constructor(private readonly wishService: WishService) {}

  @Public()
  @Post()
  create(@Body() createWishDto: CreateWishDto) {
    return this.wishService.create(createWishDto);
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.wishService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.wishService.findOne(+id);
  }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateWishDto: UpdateWishDto) {
  //   return this.wishService.update(+id, updateWishDto);
  // }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.wishService.remove(+id);
  }
}
