/// <reference types="multer" />
import {
  Controller,
  Delete,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { FormDataJson } from "../decorators/form-data-json.decorator";
import { UploadedFileField } from "../decorators/uploaded-file-field.decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { ImageFileConstants } from "../libs/constants/file.constants";
import { throttlerConstants } from "../libs/constants/throttler.constants";
import { ImageValidationPipe } from "../pipes/ImageFileValidationPipe";
import { MediaUploadDto } from "./dto/media-upload.dto";
import { MediaService } from "./media.service";

@UseGuards(JwtGuard)
@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      ttl: throttlerConstants.MEDIA_UPLOAD_TTL_MS,
      limit: throttlerConstants.MEDIA_UPLOAD_LIMIT,
    },
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "file", maxCount: 1 }], {
      limits: { fileSize: ImageFileConstants.MAX_SIZE_BYTES, files: 1 },
    }),
  )
  upload(
    @UploadedFileField("file", new ImageValidationPipe())
    file: Express.Multer.File,
    @FormDataJson("data", MediaUploadDto) mediaUploadDto: MediaUploadDto,
  ) {
    return this.mediaService.upload(file, mediaUploadDto);
  }

  @Delete()
  delete(key: string) {
    return this.mediaService.delete(key);
  }
}
