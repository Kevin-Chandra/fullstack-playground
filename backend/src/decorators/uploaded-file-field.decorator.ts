/// <reference types="multer" />
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UploadedFileField = createParamDecorator(
  (field: string, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ files?: Record<string, Express.Multer.File[]> }>();

    return request.files?.[field]?.[0];
  },
);
