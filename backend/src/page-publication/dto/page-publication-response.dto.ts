import { PagePublication } from "../../libs/entity/page-publication.entity";

export type PagePublicationListItem = Pick<
  PagePublication,
  "id" | "version" | "description" | "publishedAt" | "publishedBy"
> & {
  /** True for the publication currently being served to visitors. */
  isLive: boolean;
};
