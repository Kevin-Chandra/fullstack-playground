import * as z from "zod";
import { MediaType } from "../../libs/entity/enums/media-type.enum";
import { SectionType } from "../../libs/entity/enums/section-type.enum";

/**
 * The contract for a section's `data` payload.
 *
 * `z.object` strips unknown properties rather than rejecting them, matching the
 * global `ValidationPipe({ whitelist: true })` that governs the rest of the API.
 * Services must persist the *parsed output*, never the raw input — that is what
 * keeps stray fields out of the jsonb column, and what lets the editor PATCH a
 * payload straight back after a GET (the response-only `url` on each media ref
 * is simply dropped here).
 */
export type SectionDefinition = {
  /** Types that only make sense once on the page cannot be added or duplicated twice. */
  singleton: boolean;
  schema: z.ZodType;
};

const mediaRefSchema = z.object({
  key: z.string().min(1).max(255),
  mediaType: z.enum(MediaType),
  alt: z.string().max(160).optional(),
});

/**
 * A link the public page will render as an `href`.
 *
 * `z.url()` on its own only checks the string parses as a URL, which
 * `javascript:` and `data:text/html` both do — and every one of these values is
 * served to visitors by the public read, so accepting either is stored XSS the
 * moment the renderer emits it. Only the two schemes a link can legitimately
 * use get through.
 */
const linkUrlSchema = z.url({
  protocol: /^https?$/,
  error: "Link must be an http(s) URL.",
});

const socialLinkSchema = z.object({
  platform: z.string().min(1).max(40),
  url: linkUrlSchema,
});

const personSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(600).optional(),
  photo: mediaRefSchema.optional(),
  socials: z.array(socialLinkSchema).max(5).optional(),
});

const heroSchema = z.object({
  title: z.string().min(1).max(120),
  subtitle: z.string().max(240).optional(),
  background: mediaRefSchema.optional(),
});

const dateTimeSchema = z.iso.datetime({
  offset: true,
  error: "Must be an ISO 8601 date-time with a UTC offset or Z.",
});

const countdownSchema = z.object({
  label: z.string().max(120).optional(),
  targetDate: dateTimeSchema,
});

/**
 * Bride and groom are one section rather than two so they stay visually paired
 * and move as a unit when the page is reordered.
 */
const coupleSchema = z.object({
  heading: z.string().max(120).optional(),
  bride: personSchema,
  groom: personSchema,
});

const receptionSchema = z.object({
  heading: z.string().max(120).optional(),
  venueName: z.string().min(1).max(160),
  address: z.string().min(1).max(400),
  startsAt: dateTimeSchema,
  endsAt: dateTimeSchema.optional(),
  mapUrl: linkUrlSchema.optional(),
  notes: z.string().max(600).optional(),
});

/**
 * Empty on purpose: a gallery is created first, then filled as uploads land.
 */
const gallerySchema = z.object({
  heading: z.string().max(120).optional(),
  images: z.array(mediaRefSchema).max(30).default([]),
});

export const sectionRegistry = {
  [SectionType.HERO]: { singleton: true, schema: heroSchema },
  [SectionType.COUNTDOWN]: { singleton: true, schema: countdownSchema },
  [SectionType.COUPLE]: { singleton: true, schema: coupleSchema },
  [SectionType.RECEPTION]: { singleton: true, schema: receptionSchema },
  [SectionType.GALLERY]: { singleton: false, schema: gallerySchema },
} satisfies Record<SectionType, SectionDefinition>;

export function getSectionDefinition(type: SectionType): SectionDefinition {
  return sectionRegistry[type];
}
