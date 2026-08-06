import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Guest } from "./guest.entity";

@Entity({ name: "rsvp" })
export class Rsvp {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "int" })
  pax: number;

  @Column({ type: "boolean" })
  attending: boolean;

  @Column({ type: "text", nullable: true })
  notes: string;

  @OneToOne(() => Guest, (guest) => guest.rsvp, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "guestId" })
  guest: Guest;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    select: false,
  })
  updatedAt: Date;
}
