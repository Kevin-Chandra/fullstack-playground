/// <reference types="multer" />
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { DataSource, Repository } from "typeorm";
import { GuestService } from "../guest/guest.service";
import { StoragePrefixes } from "../libs/constants/file.constants";
import { paginationConstants } from "../libs/constants/pagination.constants";
import { Wish } from "../libs/entity/wish.entity";
import { PaginationUtil } from "../libs/utils/pagination.util";
import { StorageService } from "../storage/storage.service";
import { CreateWishDto } from "./dto/create-wish.dto";
import { UpdateWishDto } from "./dto/update-wish.dto";
import { WishResponse } from "./dto/wish-response.dto";

@Injectable()
export class WishService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,

    private readonly guestService: GuestService,

    private readonly storageService: StorageService,

    private dataSource: DataSource,
  ) {
    this.logger = new Logger("Wish Service");
  }

  async create(
    createWishDto: CreateWishDto,
    image?: Express.Multer.File,
    audio?: Express.Multer.File,
  ): Promise<boolean> {
    const guest = await this.guestService.getGuestByUuid(
      createWishDto.guestUuid,
    );

    const wish: Wish = this.wishRepository.create(createWishDto);
    wish.guest = guest;

    const uploadedKeys: string[] = [];

    try {
      const [imageUpload, audioUpload] = await Promise.allSettled([
        image
          ? this.storageService.upload(image, StoragePrefixes.WISH_IMAGE)
          : Promise.resolve<string>(null),
        audio
          ? this.storageService.upload(audio, StoragePrefixes.WISH_AUDIO)
          : Promise.resolve<string>(null),
      ]);

      if (imageUpload.status === "fulfilled" && imageUpload.value) {
        wish.imageKey = imageUpload.value;
        uploadedKeys.push(imageUpload.value);
      }

      if (audioUpload.status === "fulfilled" && audioUpload.value) {
        wish.audioKey = audioUpload.value;
        uploadedKeys.push(audioUpload.value);
      }

      // Rethrown only after both keys are recorded above.
      if (imageUpload.status === "rejected") {
        throw imageUpload.reason;
      }

      if (audioUpload.status === "rejected") {
        throw audioUpload.reason;
      }

      await this.wishRepository.save(wish);
      return true;
    } catch (error) {
      await Promise.all(
        uploadedKeys.map((key) => this.storageService.remove(key)),
      );

      throw error;
    }
  }

  async findAll(query: PaginateQuery): Promise<Paginated<WishResponse>> {
    const result = await paginate(query, this.wishRepository, {
      select: [
        "id",
        "message",
        "createdAt",
        "imageKey",
        "audioKey",
        "guest.id",
        "guest.name",
      ],
      relations: { guest: true },
      defaultLimit: paginationConstants.ITEM_PER_PAGE,
      maxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
      sortableColumns: ["createdAt"],
      defaultSortBy: [["createdAt", "DESC"]],
      searchableColumns: ["message", "guest.name"],
    });

    PaginationUtil.assertPageInRange(query, result);

    const page = result as unknown as Paginated<WishResponse>;
    page.data = result.data.map((wish) => this.toResponse(wish));

    return page;
  }

  async findOne(id: number): Promise<WishResponse> {
    const result = await this.wishRepository.findOne({
      where: { id },
      select: {
        id: true,
        message: true,
        createdAt: true,
        updatedAt: true,
        imageKey: true,
        audioKey: true,
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

    return this.toResponse(result);
  }

  async update(id: number, updateWishDto: UpdateWishDto): Promise<Wish> {
    await this.wishRepository.update(id, updateWishDto);
    return this.wishRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<null> {
    const wish = await this.wishRepository.findOne({
      where: { id },
      select: { id: true, imageKey: true, audioKey: true },
    });

    if (!wish) {
      throw new NotFoundException(`Wish with id ${id} not found.`);
    }

    await this.wishRepository.delete(id);

    await Promise.all(
      [wish.imageKey, wish.audioKey]
        .filter(Boolean)
        .map((key) => this.storageService.remove(key)),
    );

    return null;
  }

  private toResponse(wish: Wish): WishResponse {
    const { imageKey, audioKey, ...rest } = wish;

    return {
      ...rest,
      imageUrl: this.storageService.getPublicUrl(imageKey),
      audioUrl: this.storageService.getPublicUrl(audioKey),
    };
  }
}
