import { PageSection } from "../../libs/entity/page-section.entity";

/**
 * `data` carries the stored payload with a `url` added beside every media key,
 * the same way `WishResponse` exposes `imageUrl` next to a persisted key.
 */
export type PageConfigResponse = Pick<
  PageSection,
  "id" | "uuid" | "type" | "sortOrder" | "isVisible"
> & {
  data: Record<string, unknown>;
};

export type PageDraftResponse = {
  draftVersion: number;
  sections: PageConfigResponse[];
};
