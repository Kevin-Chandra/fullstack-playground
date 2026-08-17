/// <reference types="multer" />
import { Injectable } from "@nestjs/common";
import { StoragePrefixes } from "../libs/constants/file.constants";
import { StorageService } from "../storage/storage.service";
import { MediaResponse } from "./dto/media-response.dto";

@Injectable()
export class MediaService {
  constructor(private readonly storageService: StorageService) {}

  async upload(file: Express.Multer.File): Promise<MediaResponse> {
    const key = await this.storageService.upload(
      file,
      StoragePrefixes.HOME_PAGE_IMAGE,
    );

    return { key, url: this.storageService.getPublicUrl(key) };
  }

  async delete(key: string) {
    return this.storageService.remove(key);
  }
}
