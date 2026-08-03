import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Public } from "../decorators/public.decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { CreateRsvpDto } from "./dto/create-rsvp.dto";
import { RsvpService } from "./rsvp.service";

@UseGuards(JwtGuard)
@Controller("rsvp")
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  @Public()
  @Post()
  create(@Body() createRsvpDto: CreateRsvpDto) {
    return this.rsvpService.create(createRsvpDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.rsvpService.findOne(+id);
  }

  @Public()
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.rsvpService.remove(+id);
  }
}
