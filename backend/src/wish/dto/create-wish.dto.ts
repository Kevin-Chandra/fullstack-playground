import { IsNotEmpty, IsString } from "class-validator";

export class CreateWishDto {
  @IsString()
  @IsNotEmpty()
  guestUuid!: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
