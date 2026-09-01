import { MediaType } from "./enum/MediaType.enum";
import { SectionType } from "./enum/SectionType.enum";

/**
 * A reference to an uploaded object. `url` is response-only — the backend
 * resolves it on read and strips it on write, so a section fetched from GET
 * can be posted back unmodified.
 */
export interface MediaRef {
  key: string;
  mediaType: MediaType;
  alt?: string;
  url?: string | null;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SectionPerson {
  name: string;
  description?: string;
  photo?: MediaRef;
  socials?: SocialLink[];
}

export interface HeroSectionData {
  title: string;
  subtitle?: string;
  background?: MediaRef;
}

export interface CountdownSectionData {
  label?: string;
  /** ISO 8601 date-time with a UTC offset or Z. */
  targetDate: string;
}

export interface CoupleSectionData {
  heading?: string;
  bride: SectionPerson;
  groom: SectionPerson;
}

export interface ReceptionSectionData {
  heading?: string;
  venueName: string;
  address: string;
  startsAt: string;
  endsAt?: string;
  mapUrl?: string;
  notes?: string;
}

export interface GallerySectionData {
  heading?: string;
  images: MediaRef[];
}

/** Maps each section type to the `data` payload its backend schema accepts. */
export interface SectionDataMap {
  [SectionType.HERO]: HeroSectionData;
  [SectionType.COUNTDOWN]: CountdownSectionData;
  [SectionType.COUPLE]: CoupleSectionData;
  [SectionType.RECEPTION]: ReceptionSectionData;
  [SectionType.GALLERY]: GallerySectionData;
}

/** Distributes `TBase` across every section type so `type` narrows `data`. */
type SectionOf<TBase> = {
  [K in SectionType]: TBase & { type: K; data: SectionDataMap[K] };
}[SectionType];

/** A section as returned by the draft read. */
export type PageSection = SectionOf<{
  id: string;
  uuid: string;
  sortOrder: number;
  isVisible: boolean;
}>;

/**
 * A section as sent on save. No `sortOrder` — the backend derives it from the
 * array index. `isVisible` defaults to true when omitted.
 */
export type PageSectionPayload = SectionOf<{
  uuid: string;
  isVisible?: boolean;
}>;

export interface PageDraft {
  draftVersion: number;
  sections: PageSection[];
}

/**
 * Full-replacement save: sections missing from `sections` are deleted, and
 * `draftVersion` must match the server's or the write is rejected as stale.
 */
export interface SavePageConfigPayload {
  draftVersion: number;
  sections: PageSectionPayload[];
}
