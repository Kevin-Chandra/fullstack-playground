/// <reference types="multer" />
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  AudioFileConstants,
  ImageFileConstants,
  StoragePrefixes,
  StorageTypePath,
  VideoFileConstants,
} from "../libs/constants/file.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../libs/entity/enums/media-upload-path";
import { Media } from "../libs/entity/media.entity";
import { StorageService } from "../storage/storage.service";
import { MediaResponse } from "./dto/media-response.dto";
import { MediaUploadDto } from "./dto/media-upload.dto";

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

  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,

    private readonly storageService: StorageService,
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
   */
  async delete(key: string): Promise<void> {
    await this.mediaRepository.update(
      { key },
      { deletedFromStorageAt: new Date() },
    );

    return this.storageService.remove(key);
  }

  /**
   * Checks the bytes against the `mediaType` the caller declared.
   *
   * The route's pipe can only ask "is this media at all", because the declared
   * type arrives in the JSON blob beside the file rather than in the file. This
   * is where the two are reconciled — otherwise an mp3 could be filed under
   * `/images` and served as one.
   */
  private assertFileMatchesType(
    file: Express.Multer.File,
    mediaType: MediaType,
  ): void {
    const accepted: Record<MediaType, RegExp> = {
      [MediaType.IMAGE]: ImageFileConstants.ACCEPTED_TYPE,
      [MediaType.AUDIO]: AudioFileConstants.ACCEPTED_TYPE,
      [MediaType.VIDEO]: VideoFileConstants.ACCEPTED_TYPE,
    };

    if (!accepted[mediaType].test(file.mimetype)) {
      throw new BadRequestException(
        `A ${mediaType} upload cannot be a ${file.mimetype} file.`,
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
