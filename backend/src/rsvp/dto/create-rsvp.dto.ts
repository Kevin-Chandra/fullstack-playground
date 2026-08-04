import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class CreateRsvpDto {
  @IsString()
  @IsNotEmpty()
  guestUuid: string;

  @IsInt()
  @Min(0)
  pax: number;

  @IsBoolean()
  attending: boolean;

  @IsOptional()
  @IsString()
  notes: string;
}
