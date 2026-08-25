import {
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
} from "@nestjs/common";
import { MediaFileConstants } from "../libs/constants/file.constants";

/**
 * Accepts any of the three media kinds the route serves.
 *
 * It cannot be narrower: the declared `mediaType` arrives in the JSON blob
 * beside the file, which a file pipe never sees. `MediaService.upload` is what
 * checks the bytes match what the caller said they were sending.
 */
@Injectable()
export class MediaValidationPipe extends ParseFilePipe {
  constructor({ isRequired = true }: { isRequired?: boolean } = {}) {
    super({
      fileIsRequired: isRequired,
      validators: [
        new MaxFileSizeValidator({
          maxSize: MediaFileConstants.MAX_SIZE_BYTES,
        }),
        new FileTypeValidator({
          fileType: MediaFileConstants.ACCEPTED_TYPE,
          fallbackToMimetype: true,
          errorMessage: "File must be an image, audio or video file.",
        }),
      ],
    });
  }
}
