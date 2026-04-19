import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateGuestDto } from "./dto/create-guest.dto";
import { Guest } from "../libs/entity/guest.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { UpdateGuestDto } from "./dto/update-guest.dto";
import { generate } from "short-uuid";

@Injectable()
export class GuestService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,

    private dataSource: DataSource,
  ) {
    this.logger = new Logger("Guest Service");
  }

  async create(createGuestDto: CreateGuestDto) {
    const uuid = generate();

    const guest = {
      guestUuid: uuid,
      attending: false,
      name: createGuestDto.name,
      estimatedPax: createGuestDto.pax,
      phoneNumber: createGuestDto.phoneNumber,
      email: createGuestDto.email,
      invitationType: createGuestDto.invitationType,
    };

    const guestEntity = this.guestRepository.create(guest);
    return await this.guestRepository.save(guestEntity);
  }

  async getGuestById(id: number): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { id: id },
    });

    if (!guest) {
      throw new NotFoundException("Guest not found");
    }

    return guest;
  }

  async getGuestByUuid(uuid: string): Promise<Guest> {
    const guest = await this.guestRepository.findOne({
      where: { guestUuid: uuid },
    });

    if (!guest) {
      throw new NotFoundException("Guest not found");
    }

    return guest;
  }

  getGuests() {
    return this.guestRepository.find();
  }

  async update(id: number, updateGuestDto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.getGuestById(id);

    const { pax, ...rest } = updateGuestDto;

    Object.assign(guest, rest);
    if (pax !== undefined) {
      guest.estimatedPax = pax;
    }

    return await this.guestRepository.save(guest);
  }

  remove(id: number) {
    return this.guestRepository.delete(id);
  }
}
