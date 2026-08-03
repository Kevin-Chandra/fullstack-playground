import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreateRsvpDto {
  @IsString()
  @IsNotEmpty()
  guestUuid: string;

  @IsInt()
  @Min(1)
  pax: number;

  @IsOptional()
  @IsString()
  notes: string;
}
