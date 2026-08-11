import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  Type,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

type FormDataJsonOptions = {
  field: string;
  dto: Type<object>;
};

const FormDataJsonDecorator = createParamDecorator(
  async ({ field, dto }: FormDataJsonOptions, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ body?: Record<string, unknown> }>();
    const raw = request.body?.[field];

    if (typeof raw !== "string") {
      throw new BadRequestException(`"${field}" must be a JSON string field`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      throw new BadRequestException(`"${field}" is not valid JSON`);
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new BadRequestException(`"${field}" must be a JSON object`);
    }

    const instance = plainToInstance(dto, parsed);
    const errors = await validate(instance, { whitelist: true });
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.flatMap((error) => Object.values(error.constraints ?? {})),
      );
    }

    return instance;
  },
);

export const FormDataJson = (field: string, dto: Type<object>) =>
  FormDataJsonDecorator({ field, dto });
