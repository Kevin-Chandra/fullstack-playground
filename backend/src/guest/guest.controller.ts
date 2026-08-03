import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import type { PaginateQuery } from "nestjs-paginate";
import { Paginate } from "nestjs-paginate";
import { Public } from "../decorators/public.decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { CreateGuestDto } from "./dto/create-guest.dto";
import { UpdateGuestDto } from "./dto/update-guest.dto";
import { GuestService } from "./guest.service";

@UseGuards(JwtGuard)
@Controller("guest")
export class GuestController {
  constructor(private readonly guestService: GuestService) {}

  @Post()
  createGuest(@Body() createGuestDto: CreateGuestDto) {
    return this.guestService.create(createGuestDto);
  }

  @Public()
  @Get(":uuid")
  getGuestByUuid(@Param("uuid") id: string) {
    return this.guestService.getGuestByUuid(id);
  }

  @Get("id/:id")
  getGuestById(@Param("id", ParseIntPipe) id: number) {
    return this.guestService.getGuestById(id);
  }

  @Get()
  getGuests(@Paginate() query: PaginateQuery) {
    return this.guestService.getGuests(query);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateGuestDto: UpdateGuestDto) {
    return this.guestService.update(+id, updateGuestDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.guestService.remove(+id);
  }
}
