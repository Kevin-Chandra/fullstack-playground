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
import { GuestService } from "./guest.service";
import { CreateGuestDto } from "./dto/create-guest.dto";
import { UpdateGuestDto } from "./dto/update-guest.dto";
import { JwtGuard } from "../guards/jwt.guard";
import { Public } from "../decorators/public.decorator";

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
  getGuests() {
    return this.guestService.getGuests();
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
