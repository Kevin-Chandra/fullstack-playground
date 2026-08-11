import {
  FileTypeValidator,
  Injectable,
  MaxFileSizeValidator,
  ParseFilePipe,
} from "@nestjs/common";
import { ImageFileConstants } from "../libs/constants/file.constants";

@Injectable()
export class ImageValidationPipe extends ParseFilePipe {
  constructor({ isRequired = true }: { isRequired?: boolean } = {}) {
    super({
      fileIsRequired: isRequired,
      validators: [
        new MaxFileSizeValidator({
          maxSize: ImageFileConstants.MAX_SIZE_BYTES,
        }),
        new FileTypeValidator({
          fileType: ImageFileConstants.ACCEPTED_TYPE,
          errorMessage: "File must be an image file.",
        }),
      ],
    });
  }
}
