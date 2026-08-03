import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Guest } from "./guest.entity";

@Entity({ name: "rsvp" })
export class Rsvp {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "int" })
  paxNumber: number;

  @OneToOne(() => Guest, (guest) => guest.rsvp, { onDelete: "CASCADE" })
  @JoinColumn({ name: "guestId" })
  guest: Guest;
}
