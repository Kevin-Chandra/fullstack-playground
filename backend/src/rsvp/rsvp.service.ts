import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { GuestService } from "../guest/guest.service";
import { Rsvp } from "../libs/entity/rsvp.entity";
import { CreateRsvpDto } from "./dto/create-rsvp.dto";

@Injectable()
export class RsvpService {
  constructor(
    @InjectRepository(Rsvp)
    private readonly rsvpRepository: Repository<Rsvp>,

    private readonly guestService: GuestService,

    private dataSource: DataSource,
  ) {}

  async create(createRsvpDto: CreateRsvpDto): Promise<Rsvp> {
    const { guestUuid } = createRsvpDto;

    const guest = await this.guestService.getGuestByUuid(guestUuid);
    if (!guest) {
      throw new NotFoundException("Guest not found");
    }

    const existing = await this.dataSource
      .getRepository(Rsvp)
      .createQueryBuilder("rsvp")
      .leftJoinAndSelect("rsvp.guest", "guest")
      .where("guest.guestUuid = :uuid", { uuid: guestUuid })
      .getOne();

    if (existing) {
      throw new ConflictException("Guest has already responded");
    }

    const rsvp = this.rsvpRepository.create({
      pax: createRsvpDto.pax,
      notes: createRsvpDto.notes,
      guest,
    });

    return await this.rsvpRepository.save(rsvp);
  }

  async findOne(id: number): Promise<Rsvp> {
    const rsvp = await this.rsvpRepository.findOneBy({ id: id });
    if (!rsvp) {
      throw new NotFoundException("RSVP not found");
    }

    return rsvp;
  }

  async remove(id: number) {
    const rsvp = await this.rsvpRepository.findOneBy({ id: id });
    if (!rsvp) {
      throw new NotFoundException("RSVP not found");
    }

    await this.rsvpRepository.delete({ id: id });
    return true;
  }
}
