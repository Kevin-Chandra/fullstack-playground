import { IsEnum } from "class-validator";
import { MediaType } from "../../libs/entity/enums/media-type.enum";
import { MediaUploadPath } from "../../libs/entity/enums/media-upload-path";

export class MediaUploadDto {
  @IsEnum(MediaUploadPath)
  mediaUploadPath: MediaUploadPath;

  @IsEnum(MediaType)
  mediaType: MediaType;
}
