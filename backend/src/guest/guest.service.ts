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
import { Guest } from "../libs/entity/guest.entity";
import { PaginationUtil } from "../libs/utils/pagination.util";
import { CreateGuestDto } from "./dto/create-guest.dto";
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

  async getGuests(query: PaginateQuery): Promise<Paginated<Guest>> {
    const result = await paginate(query, this.guestRepository, {
      select: ["id", "name", "pax"],
      defaultLimit: paginationConstants.ITEM_PER_PAGE,
      maxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
      sortableColumns: ["name"],
      searchableColumns: ["name"],
      filterableColumns: {
        userStatus: [FilterOperator.EQ],
      },
    });

    PaginationUtil.assertPageInRange(query, result);
    return result;
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
}
