import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GuestModule } from "../guest/guest.module";
import { Rsvp } from "../libs/entity/rsvp.entity";
import { RsvpController } from "./rsvp.controller";
import { RsvpService } from "./rsvp.service";

@Module({
  imports: [TypeOrmModule.forFeature([Rsvp]), GuestModule],
  controllers: [RsvpController],
  providers: [RsvpService],
})
export class RsvpModule {}
