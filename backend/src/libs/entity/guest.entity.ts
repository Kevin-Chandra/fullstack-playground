import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { InvitationType } from "./enums/invitation-type.enum";

@Entity({ name: "guests" })
export class Guest {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", unique: true })
  guestUuid: string;

  @Column({ type: "int" })
  estimatedPax: number;

  @Column({ type: "int", default: 0 })
  confirmedPax: number;

  @Column()
  attending: boolean;

  @Column({ type: "text" })
  phoneNumber: string;

  @Column({ type: "text" })
  email: string;

  @Column({
    type: "enum",
    enum: InvitationType,
    default: InvitationType.ONLINE,
  })
  invitationType: InvitationType;
}
