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
