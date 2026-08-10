import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { InvitationType } from "./enums/invitation-type.enum";
import { Rsvp } from "./rsvp.entity";

@Entity({ name: "guests" })
export class Guest {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", unique: true })
  uuid: string;

  @Column({ type: "int" })
  pax: number;

  @Column({ type: "text", nullable: true })
  phoneNumber: string;

  @Column({ type: "text", nullable: true })
  email: string;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @Column({
    type: "enum",
    enum: InvitationType,
    default: InvitationType.ONLINE,
  })
  invitationType: InvitationType;

  @OneToOne(() => Rsvp, (rsvp) => rsvp.guest, { cascade: true })
  rsvp?: Rsvp | null;
}
