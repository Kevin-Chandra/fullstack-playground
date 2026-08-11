/// <reference types="multer" />
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { PaginateQuery } from "nestjs-paginate";
import { Paginate } from "nestjs-paginate";
import { FormDataJson } from "../decorators/form-data-json.decorator";
import { Public } from "../decorators/public.decorator";
import { UploadedFileField } from "../decorators/uploaded-file-field.decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { UploadLimits } from "../libs/constants/file.constants";
import { throttlerConstants } from "../libs/constants/throttler.constants";
import { AudioValidationPipe } from "../pipes/AudioFileValidationPipe";
import { ImageValidationPipe } from "../pipes/ImageFileValidationPipe";
import { CreateWishDto } from "./dto/create-wish.dto";
import { WishService } from "./wish.service";

@UseGuards(JwtGuard)
@Controller("wish")
export class WishController {
  constructor(private readonly wishService: WishService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({
    default: {
      ttl: throttlerConstants.UPLOAD_TTL_MS,
      limit: throttlerConstants.UPLOAD_LIMIT,
    },
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 1 },
        { name: "audio", maxCount: 1 },
      ],
      { limits: { fileSize: UploadLimits.MAX_FILE_SIZE_BYTES, files: 2 } },
    ),
  )
  create(
    @UploadedFileField("image", new ImageValidationPipe({ isRequired: false }))
    image: Express.Multer.File,
    @UploadedFileField("audio", new AudioValidationPipe({ isRequired: false }))
    audio: Express.Multer.File,
    @FormDataJson("data", CreateWishDto) createWishDto: CreateWishDto,
  ) {
    return this.wishService.create(createWishDto, image, audio);
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.wishService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.wishService.findOne(+id);
  }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateWishDto: UpdateWishDto) {
  //   return this.wishService.update(+id, updateWishDto);
  // }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.wishService.remove(+id);
  }
}
