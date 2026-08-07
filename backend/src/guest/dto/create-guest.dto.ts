import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
  ValidateIf,
} from "class-validator";
import { InvitationType } from "../../libs/entity/enums/invitation-type.enum";

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  pax: number;

  @ValidateIf((o: CreateGuestDto) => !!o.phoneNumber)
  @IsPhoneNumber()
  phoneNumber?: string;

  @ValidateIf((o: CreateGuestDto) => !!o.email)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(InvitationType)
  invitationType: InvitationType;
}
