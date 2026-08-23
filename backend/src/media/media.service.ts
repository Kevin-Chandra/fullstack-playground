/// <reference types="multer" />
import { Injectable } from "@nestjs/common";
import {
  StoragePrefixes,
  StorageTypePath,
} from "../libs/constants/file.constants";
import { MediaType } from "../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../libs/entity/enums/media-upload-path";
import { StorageService } from "../storage/storage.service";
import { MediaResponse } from "./dto/media-response.dto";
import { MediaUploadDto } from "./dto/media-upload.dto";

@Injectable()
export class MediaService {
  constructor(private readonly storageService: StorageService) {}

  async upload(
    file: Express.Multer.File,
    mediaUploadDto: MediaUploadDto,
  ): Promise<MediaResponse> {
    const path = this.resolvedStoragePath(
      mediaUploadDto.mediaUploadPath,
      mediaUploadDto.mediaType,
    );

    const key = await this.storageService.upload(file, path);

    return { key, url: this.storageService.getPublicUrl(key) };
  }

  async delete(key: string) {
    return this.storageService.remove(key);
  }

  private resolvedStoragePath(
    mediaUploadPath: MediaUploadPath,
    mediaType: MediaType,
  ) {
    return `${this.resolvePrefixPath(mediaUploadPath)}${this.resolvePathType(mediaType)}`;
  }

  private resolvePrefixPath(mediaUploadPath: MediaUploadPath) {
    switch (mediaUploadPath) {
      case MediaUploadPath.HOME:
        return StoragePrefixes.HOME_PAGE;
    }
  }

  private resolvePathType(mediaType: MediaType) {
    switch (mediaType) {
      case MediaType.AUDIO:
        return StorageTypePath.AUDIO;
      case MediaType.IMAGE:
        return StorageTypePath.IMAGE;
      case MediaType.VIDEO:
        return StorageTypePath.VIDEO;
    }
  }
}
