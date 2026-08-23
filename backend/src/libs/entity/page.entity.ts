import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * A server-driven page. Rows are seeded from `SeededPages` at boot rather than
 * authored: adding a page also needs a frontend route and renderer, so it is a
 * code change either way.
 */
@Entity({ name: "pages" })
export class Page {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  /** URL segment the API addresses this page by — `/page/home`. */
  @Column({ type: "text", unique: true })
  slug: string;

  @Column({ type: "text" })
  name: string;

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
}
