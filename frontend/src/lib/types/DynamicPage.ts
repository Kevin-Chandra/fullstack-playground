import { BasePaginationParam } from "./BasePaginationParam";

export interface DynamicPage {
  id: string,
  slug: string,
  name: string
}

export interface DynamicPageDetails {
  id: string,
  slug: string,
  name: string,
  livePublication: PagePublication | null;
}

export interface PagePublication {
  id: string;
  version: number;
  publishedAt: string;
  publishedBy: PagePublicationAuthor | null;
}

export interface PagePublicationAuthor {
  id: string;
  name: string;
}

export type GetPagePublicationParams = Partial<BasePaginationParam>;

export interface PagePublicationItem {
  id: string;
  version: number;
  description: string;
  publishedAt: string;
  publishedBy: PagePublicationAuthor | null;
  isLive: boolean;
}