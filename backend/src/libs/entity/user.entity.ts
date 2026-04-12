import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "text", unique: true })
  username: string;

  @Column({ type: "text", select: false })
  passwordHash: string;
}
