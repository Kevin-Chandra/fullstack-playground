import {
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
} from "@nestjs/common";
import { AudioFileConstants } from "../libs/constants/file.constants";

@Injectable()
export class AudioValidationPipe extends ParseFilePipe {
  constructor({ isRequired = true }: { isRequired?: boolean } = {}) {
    super({
      fileIsRequired: isRequired,
      validators: [
        new MaxFileSizeValidator({
          maxSize: AudioFileConstants.MAX_SIZE_BYTES,
        }),
        new FileTypeValidator({
          fileType: AudioFileConstants.ACCEPTED_TYPE,
          fallbackToMimetype: true,
          errorMessage: "File must be an audio file.",
        }),
      ],
    });
  }
}
