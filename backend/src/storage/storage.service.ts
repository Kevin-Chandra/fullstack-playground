/// <reference types="multer" />
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Bucket, R2 } from "node-cloudflare-r2";
import { generate } from "short-uuid";
import { errorCodeConstants } from "../libs/constants/error-code.constants";

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger: Logger;
  private bucket: Bucket;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger("Storage Service");
  }

  onModuleInit() {
    const r2 = new R2({
      accountId: this.configService.get<string>("CLOUDFLARE_ACCOUNT_ID"),
      accessKeyId: this.configService.get<string>("CLOUDFLARE_ACCESS_KEY_ID"),
      secretAccessKey: this.configService.get<string>(
        "CLOUDFLARE_SECRET_ACCESS_KEY",
      ),
    });

    this.bucket = r2
      .bucket(this.configService.get<string>("CLOUDFLARE_BUCKET_NAME"))
      .provideBucketPublicUrl(
        this.configService.get<string>("CLOUDFLARE_PUBLIC_URL"),
      );
  }

  /**
   * Uploads an in-memory file to the bucket.
   *
   * @param prefixPath A `StoragePrefixes` value grouping the object in the bucket.
   * @returns The generated object key. Persist this — never the public URL,
   *   which is derived from it via {@link getPublicUrl}.
   */
  async upload(file: Express.Multer.File, prefixPath: string): Promise<string> {
    const { ext, mime } = await this.detectFileType(file);
    const key = this.buildObjectKey(prefixPath, ext);

    try {
      const result = await this.bucket.upload(
        file.buffer,
        key,
        undefined,
        mime ?? "application/octet-stream",
      );

      return result.objectKey;
    } catch (error) {
      this.logger.error(`Failed to upload object ${key}`, error);

      throw new InternalServerErrorException(
        "Failed to upload file.",
        errorCodeConstants.FILE_UPLOAD_FAILED,
      );
    }
  }

  async copyObject(objectKey: string, copyPath: string): Promise<string> {
    const ext = this.getExtensionFromKey(objectKey);
    const key = this.buildObjectKey(copyPath, ext);
    try {
      await this.bucket.copyObject(objectKey, key);
      return key;
    } catch (error) {
      this.logger.error(`Failed to upload object ${key}`, error);
      throw new InternalServerErrorException(
        "Failed to upload file.",
        errorCodeConstants.FILE_UPLOAD_FAILED,
      );
    }
  }

  async renameObject(
    objectKey: string,
    newPrefixPath: string,
  ): Promise<string> {
    const filename = objectKey.split("/").pop() ?? objectKey;
    const key = `${newPrefixPath}/${filename}`;

    if (key === objectKey) {
      return key;
    }

    try {
      await this.bucket.copyObject(objectKey, key);
    } catch (error) {
      this.logger.error(`Failed to copy object ${objectKey} to ${key}`, error);

      throw new InternalServerErrorException(
        "Failed to move file.",
        errorCodeConstants.FILE_UPLOAD_FAILED,
      );
    }

    await this.remove(objectKey);

    return key;
  }

  async remove(key: string): Promise<void> {
    if (!key) {
      return;
    }

    try {
      const deleted = await this.bucket.deleteObject(key);

      if (!deleted) {
        this.logger.error(
          `Failed to delete object ${key}: bucket rejected the request`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to delete object ${key}`, error);
    }
  }

  /**
   * Derives the public URL of an object. Pure string work against the base URL
   * registered in `onModuleInit` — no network call, safe to call per row.
   */
  getPublicUrl(key: string): string | null {
    if (!key) {
      return null;
    }

    return this.bucket.getObjectPublicUrls(key)[0] ?? null;
  }

  private async detectFileType(file: Express.Multer.File) {
    const { fileTypeFromBuffer } = await import("file-type");

    return fileTypeFromBuffer(file.buffer);
  }

  /**
   * Builds a collision-free key from a random id and the file's real extension.
   *
   * `file.originalname` is deliberately ignored: it is attacker-controlled and
   * may contain path separators or traversal sequences.
   */
  private buildObjectKey(prefixPath: string, ext?: string): string {
    return `${prefixPath}/${generate()}.${ext ?? "bin"}`;
  }

  private getExtensionFromKey(key: string): string | undefined {
    const filename = key.split("/").pop() ?? "";
    const dotIndex = filename.lastIndexOf(".");

    if (dotIndex <= 0 || dotIndex === filename.length - 1) {
      return undefined;
    }

    return filename.slice(dotIndex + 1);
  }
}
