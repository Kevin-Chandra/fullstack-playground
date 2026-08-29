import { PagePublication } from "../../libs/entity/page-publication.entity";
import { Page } from "../../libs/entity/page.entity";

export type LivePublicationResponse = Pick<
  PagePublication,
  "id" | "version" | "description" | "publishedAt"
> & {
  publishedBy: { id: number; name: string } | null;
};

export type PageDetailsResponse = Pick<
  Page,
  "id" | "slug" | "name" | "draftVersion"
> & {
  livePublication: LivePublicationResponse | null;
};
