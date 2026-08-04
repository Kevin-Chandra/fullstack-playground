import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from "nestjs-paginate";
import { generate } from "short-uuid";
import { DataSource, Repository } from "typeorm";
import { paginationConstants } from "../libs/constants/pagination.constants";
import { GuestStatus } from "../libs/entity/enums/guest-status.enum";
import { Guest } from "../libs/entity/guest.entity";
import { Rsvp } from "../libs/entity/rsvp.entity";
import { PaginationUtil } from "../libs/utils/pagination.util";
import { CreateGuestDto } from "./dto/create-guest.dto";
import { GuestWithStatus } from "./dto/guest-with-status.dto";
import { UpdateGuestDto } from "./dto/update-guest.dto";

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

  async create(createGuestDto: CreateGuestDto): Promise<Guest> {
    const guest = this.guestRepository.create({
      ...createGuestDto,
      guestUuid: generate(),
    });

    return await this.guestRepository.save(guest);
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

  async getGuests(query: PaginateQuery): Promise<Paginated<GuestWithStatus>> {
    const result = await paginate(query, this.guestRepository, {
      select: ["id", "name", "pax", "rsvp.id", "rsvp.attending"],
      relations: { rsvp: true },
      defaultLimit: paginationConstants.ITEM_PER_PAGE,
      maxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
      sortableColumns: ["name"],
      searchableColumns: ["name"],
      filterableColumns: {
        // GuestStatus is derived, so it is filtered through the rsvp relation:
        // confirmed -> $eq:true, declined -> $eq:false, pending -> $null
        "rsvp.attending": [FilterOperator.EQ, FilterOperator.NULL],
      },
    });

    PaginationUtil.assertPageInRange(query, result);

    return {
      ...result,
      data: result.data.map((guest) => this.withGuestStatus(guest)),
    };
  }

  async update(id: number, updateGuestDto: UpdateGuestDto): Promise<Guest> {
    const guest = await this.getGuestById(id);
    if (!guest) {
      throw new NotFoundException("Guest not found");
    }

    await this.guestRepository.update({ id: id }, updateGuestDto);
    return this.getGuestById(id);
  }

  remove(id: number) {
    return this.guestRepository.delete(id);
  }

  private toGuestStatus(rsvp?: Rsvp | null): GuestStatus {
    if (!rsvp) {
      return GuestStatus.PENDING;
    }

    return rsvp.attending ? GuestStatus.CONFIRMED : GuestStatus.DECLINED;
  }

  private withGuestStatus(guest: Guest): GuestWithStatus {
    const { rsvp, ...rest } = guest;
    return { ...rest, guestStatus: this.toGuestStatus(rsvp) };
  }
}
