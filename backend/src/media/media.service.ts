/// <reference types="multer" />
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  AudioFileConstants,
  ImageFileConstants,
  StoragePrefixes,
  StorageTypePath,
  VideoFileConstants,
} from "../libs/constants/file.constants";
import { errorCodeConstants } from "../libs/constants/error-code.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../libs/entity/enums/media-upload-path";
import { Media } from "../libs/entity/media.entity";
import { PageMediaService } from "../page/page-media.service";
import { StorageService } from "../storage/storage.service";
import { MediaResponse } from "./dto/media-response.dto";
import { MediaUploadDto } from "./dto/media-upload.dto";

function toMegabytes(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

@Injectable()
export class MediaService {
  private static readonly PREFIX_BY_PATH: Record<MediaUploadPath, string> = {
    [MediaUploadPath.HOME]: StoragePrefixes.HOME_PAGE,
  };

  private static readonly PATH_BY_TYPE: Record<MediaType, string> = {
    [MediaType.IMAGE]: StorageTypePath.IMAGE,
    [MediaType.AUDIO]: StorageTypePath.AUDIO,
    [MediaType.VIDEO]: StorageTypePath.VIDEO,
  };

  /**
   * The real per-type limits. The route's pipe can only enforce the largest of
   * the three, because the declared type is not visible to it — so this is the
   * only place a 20MB image is ever refused.
   */
  private static readonly CONSTRAINTS_BY_TYPE: Record<
    MediaType,
    { MAX_SIZE_BYTES: number; ACCEPTED_TYPE: RegExp }
  > = {
    [MediaType.IMAGE]: ImageFileConstants,
    [MediaType.AUDIO]: AudioFileConstants,
    [MediaType.VIDEO]: VideoFileConstants,
  };

  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    private readonly storageService: StorageService,

    private readonly pageMediaService: PageMediaService,
  ) {}

  /**
   * Uploads the object and records it in the same request.
   *
   * The row is what later makes the object collectable: an upload the editor
   * never references would otherwise be invisible to every cleanup path. If
   * recording fails the object is removed again, the same hand-reconciliation
   * `WishService.create` does — a row with no object is a broken image, but an
   * object with no row is a bill nobody can find.
   */
  async upload(
    file: Express.Multer.File,
    mediaUploadDto: MediaUploadDto,
  ): Promise<MediaResponse> {
    this.assertFileMatchesType(file, mediaUploadDto.mediaType);

    const path = this.resolvedStoragePath(
      mediaUploadDto.mediaUploadPath,
      mediaUploadDto.mediaType,
    );

    const key = await this.storageService.upload(file, path);

    try {
      await this.mediaRepository.save(
        this.mediaRepository.create({
          key,
          mediaType: mediaUploadDto.mediaType,
          uploadPath: mediaUploadDto.mediaUploadPath,
          deletedFromStorageAt: null,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to record uploaded object ${key}`, error);
      await this.storageService.remove(key);

      throw error;
    }

    return { key, url: this.storageService.getPublicUrl(key) };
  }

  /**
   * Removes an object and tombstones its row, so nothing can go on to
   * reference a key whose object is gone.
   *
   * The reference check is the whole point of routing this through
   * `PageMediaService` rather than deleting outright: the caller only knows the
   * draft it is editing, while a key can also be held by a **retained
   * publication** — the snapshot the live page is served from. Deleting one of
   * those breaks the live page immediately and every rollback to it
   * permanently. Dropping a still-referenced file is not this endpoint's job:
   * remove the ref, save, and the save's own prune collects it once nothing
   * points at it.
   *
   * A key with no `media` row is refused rather than deleted. Every upload this
   * module records has one, so an unrecorded key belongs to a module whose
   * references this one cannot see.
   */
  async delete(key: string): Promise<void> {
    const media = await this.mediaRepository.findOne({ where: { key } });

    if (!media) {
      throw new NotFoundException(`No media recorded for ${key}.`, {
        description: errorCodeConstants.MEDIA_NOT_FOUND,
      });
    }

    // Already collected. The object is gone and the row says so, which is the
    // state the caller asked for.
    if (media.deletedFromStorageAt !== null) {
      return;
    }

    const collected = await this.pageMediaService.collectUnreferenced([key]);

    if (!collected.includes(key)) {
      throw new ConflictException(
        `${key} is still used by a page and cannot be deleted.`,
        { description: errorCodeConstants.MEDIA_IN_USE },
      );
    }
  }

  /**
   * Checks the bytes against the `mediaType` the caller declared — both what
   * kind of file it is and how big it is allowed to be.
   *
   * The route's pipe can only ask "is this media at all, and is it under the
   * largest limit of the three", because the declared type arrives in the JSON
   * blob beside the file rather than in the file. This is where the two are
   * reconciled — otherwise an mp3 could be filed under `/images` and served as
   * one, and a 24MB JPEG would pass under the video allowance.
   *
   * Runs before the object is uploaded, so a refused file never reaches
   * storage.
   */
  private assertFileMatchesType(
    file: Express.Multer.File,
    mediaType: MediaType,
  ): void {
    const { ACCEPTED_TYPE, MAX_SIZE_BYTES } =
      MediaService.CONSTRAINTS_BY_TYPE[mediaType];

    if (!ACCEPTED_TYPE.test(file.mimetype)) {
      throw new BadRequestException(
        `A ${mediaType} upload cannot be a ${file.mimetype} file.`,
        { description: errorCodeConstants.FILE_TYPE_UNSUPPORTED },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `A ${mediaType} file must be ${toMegabytes(MAX_SIZE_BYTES)}MB or smaller.`,
        { description: errorCodeConstants.FILE_TOO_LARGE },
      );
    }
  }

  private resolvedStoragePath(
    mediaUploadPath: MediaUploadPath,
    mediaType: MediaType,
  ): string {
    return `${MediaService.PREFIX_BY_PATH[mediaUploadPath]}${MediaService.PATH_BY_TYPE[mediaType]}`;
  }
}
