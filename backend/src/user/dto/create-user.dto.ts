import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { UserStatus } from "../../libs/entity/enums/user-status.enum";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserStatus)
  @IsOptional()
  userStatus: UserStatus;
}
