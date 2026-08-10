import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { DataSource, Repository } from "typeorm";
import { GuestService } from "../guest/guest.service";
import { paginationConstants } from "../libs/constants/pagination.constants";
import { Wish } from "../libs/entity/wish.entity";
import { PaginationUtil } from "../libs/utils/pagination.util";
import { CreateWishDto } from "./dto/create-wish.dto";
import { UpdateWishDto } from "./dto/update-wish.dto";

@Injectable()
export class WishService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,

    private readonly guestService: GuestService,

    private dataSource: DataSource,
  ) {
    this.logger = new Logger("Wish Service");
  }

  async create(createWishDto: CreateWishDto): Promise<Wish> {
    const guest = await this.guestService.getGuestByUuid(
      createWishDto.guestUuid,
    );

    if (!guest) {
      throw new NotFoundException("Guest not found");
    }

    const wish = this.wishRepository.create(createWishDto);
    wish.guest = guest;
    const newWish = await this.wishRepository.save(wish);

    return this.findOne(newWish.id);
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Wish>> {
    const result = await paginate(query, this.wishRepository, {
      select: ["id", "message", "createdAt", "guest.id", "guest.name"],
      relations: { guest: true },
      defaultLimit: paginationConstants.ITEM_PER_PAGE,
      maxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
      sortableColumns: ["createdAt"],
      defaultSortBy: [["createdAt", "DESC"]],
      searchableColumns: ["message", "guest.name"],
    });

    PaginationUtil.assertPageInRange(query, result);

    return result;
  }

  async findOne(id: number): Promise<Wish> {
    const result = await this.wishRepository.findOne({
      where: { id },
      select: {
        id: true,
        message: true,
        createdAt: true,
        updatedAt: true,
        guest: {
          id: true,
          name: true,
        },
      },
      relations: {
        guest: true,
      },
    });

    if (!result) {
      throw new NotFoundException(`Wish with id ${id} not found.`);
    }

    return result;
  }

  async update(id: number, updateWishDto: UpdateWishDto): Promise<Wish> {
    await this.wishRepository.update(id, updateWishDto);
    return this.wishRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<null> {
    const wish = await this.findOne(id);
    if (!wish) {
      throw new NotFoundException(`Wish with id ${id} not found.`);
    }

    await this.wishRepository.delete(id);
    return null;
  }
}
