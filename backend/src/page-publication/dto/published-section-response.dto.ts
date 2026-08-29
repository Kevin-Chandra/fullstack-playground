import { SectionType } from "../../libs/entity/enums/section-type.enum";

/**
 * A section as the public site receives it.
 *
 * No `id` — published sections are content lifted out of a snapshot, not rows.
 * No `isVisible` either: hidden sections are already filtered out, so exposing
 * the flag would only be noise.
 */
export type PublishedSectionResponse = {
  type: SectionType;
  sortOrder: number;
  data: Record<string, unknown>;
};
