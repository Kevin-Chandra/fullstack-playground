import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SectionType } from "./enums/section-type.enum";
import { Page } from "./page.entity";

/**
 * One section of a page's **draft**.
 *
 * These rows are the working copy, never what visitors see — the public page is
 * served from the newest `PagePublication` snapshot. Nothing here reaches the
 * public site until it is published.
 */
@Entity({ name: "page_sections" })
@Index(["pageId", "uuid"])
@Index("page_sections_data_gin", ["data"], { type: "gin" })
export class PageSection {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "varchar", unique: true })
  uuid: string;

  @Column({ type: "bigint" })
  pageId: number;

  @ManyToOne(() => Page, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "pageId" })
  page: Page;

  @Column({ type: "enum", enum: SectionType })
  type: SectionType;

  @Column({ type: "int" })
  sortOrder: number;

  @Column({ type: "boolean", default: true })
  isVisible: boolean;

  /**
   * The section's own content, shaped by its `type`. Validated against the
   * matching zod schema in `page-configs/schema/section-schema.registry.ts` on
   * every write — Postgres only guarantees this is valid JSON.
   */
  @Column({ type: "jsonb" })
  data: Record<string, unknown>;

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
