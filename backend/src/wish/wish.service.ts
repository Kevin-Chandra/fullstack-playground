import { Injectable, Logger } from "@nestjs/common";
import { CreateWishDto } from "./dto/create-wish.dto";
import { UpdateWishDto } from "./dto/update-wish.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Wish } from "../libs/entity/wish.entity";

@Injectable()
export class WishService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,

    private dataSource: DataSource,
  ) {
    this.logger = new Logger("Wish Service");
  }

  create(createWishDto: CreateWishDto): Promise<Wish> {
    const wish = this.wishRepository.create(createWishDto);
    return this.wishRepository.save(wish);
  }

  findAll(): Promise<Wish[]> {
    return this.wishRepository.find();
  }

  findOne(id: number): Promise<Wish> {
    return this.wishRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        message: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, updateWishDto: UpdateWishDto): Promise<Wish> {
    await this.wishRepository.update(id, updateWishDto);
    return this.wishRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<null> {
    await this.wishRepository.delete(id);
    return null;
  }
}
