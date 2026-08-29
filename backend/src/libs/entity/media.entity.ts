import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MediaType } from "./enums/media-type.enum";
import { MediaUploadPath } from "./enums/media-upload-path";

/**
 * One uploaded object, recorded at upload time.
 *
 * Uploads happen before the draft that will reference them is saved — often
 * long before, and sometimes never. Without a row per object the only keys
 * anything could enumerate were the ones already sitting in a saved draft, so
 * an upload the editor abandoned was unreachable by every cleanup path and
 * billed forever. This table is that work list.
 *
 * It is also what makes collection safe: `PageMediaService` only ever deletes
 * objects it has a row for, and stamps `deletedFromStorageAt` under a row lock
 * before the object goes away, so a draft cannot start referencing a key that
 * is being collected.
 */
@Entity({ name: "media" })
@Index(["deletedFromStorageAt", "createdAt"])
export class Media {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  /** The storage object key. One row per object, so unique. */
  @Column({ type: "varchar", unique: true })
  key: string;

  @Column({ type: "enum", enum: MediaType })
  mediaType: MediaType;

  /** Which page's namespace the object was uploaded into. */
  @Column({ type: "enum", enum: MediaUploadPath })
  uploadPath: MediaUploadPath;

  /**
   * Set when the object was deleted from storage. Kept as a tombstone rather
   * than dropping the row: it is what tells a concurrent save that the key it
   * wants is gone, instead of letting it store a reference to a deleted object.
   */
  @Column({ type: "timestamptz", nullable: true })
  deletedFromStorageAt: Date | null;

  @CreateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;
}
