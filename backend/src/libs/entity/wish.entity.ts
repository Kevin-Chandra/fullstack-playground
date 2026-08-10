import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Guest } from "./guest.entity";

@Entity({ name: "wishes" })
export class Wish {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column()
  message: string;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    select: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    select: false,
  })
  updatedAt: Date;

  @ManyToOne(() => Guest, (guest) => guest.wishes, { cascade: true })
  guest: Guest;
}
