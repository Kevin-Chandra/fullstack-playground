import { Type } from "class-transformer";
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";
import { SectionType } from "../../libs/entity/enums/section-type.enum";

export class PageSectionDto {
  @IsUUID()
  uuid: string;

  @IsEnum(SectionType)
  type: SectionType;

  /**
   * `@IsObject` on its own is deliberate. The global
   * `ValidationPipe({ whitelist: true })` only strips properties it has
   * metadata for, and it does not recurse without `@ValidateNested`, so the
   * payload arrives intact — adding `@ValidateNested` here would silently
   * empty it. The real check is the zod schema for `type`, applied in the
   * service.
   */
  @IsObject()
  data: Record<string, unknown>;

  /** Defaults to visible, matching the column's own default. */
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

export class PageConfigDto {
  @IsInt()
  @Min(0)
  draftVersion: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayUnique((section: PageSectionDto) => section.uuid)
  @Type(() => PageSectionDto)
  sections: PageSectionDto[];
}
