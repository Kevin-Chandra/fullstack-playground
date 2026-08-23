import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SectionType } from "./enums/section-type.enum";
import { Page } from "./page.entity";
import { User } from "./user.entity";

/**
 * One entry inside a publication's snapshot.
 *
 * Deliberately carries no `id`: a snapshot is content, not rows. Restoring one
 * creates fresh `PageSection` rows.
 */
export type PublishedSection = {
  type: SectionType;
  sortOrder: number;
  isVisible: boolean;
  data: Record<string, unknown>;
};

/**
 * An immutable snapshot of a page at the moment it was published.
 *
 * Append-only — the live page is always the newest row for its page, and
 * rollback inserts a copy rather than mutating history.
 */
@Entity({ name: "page_publications" })
@Index(["pageId", "id"])
export class PagePublication {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "bigint" })
  pageId: number;

  @ManyToOne(() => Page, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "pageId" })
  page: Page;

  @Column({ type: "int" })
  version: number;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "jsonb" })
  sections: PublishedSection[];

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.pagePublications, {
    nullable: true,
    onDelete: "SET NULL",
  })
  publishedBy: User | null;
}
