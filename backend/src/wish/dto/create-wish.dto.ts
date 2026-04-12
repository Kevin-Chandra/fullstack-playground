import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWishDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
