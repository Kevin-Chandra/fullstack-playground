import { MediaType } from "../entity/enums/media-type.enum";

/**
 * Every media file inside a home page section's `data` payload is stored as a
 * `MediaRef` — an object carrying the R2 object *key*, never a public URL.
 *
 * Because the shape is identical at every nesting depth and in every section
 * type, the two walkers below stay type-agnostic: adding a section type never
 * requires touching this file.
 */
export type MediaRef = {
  key: string;
  mediaType?: MediaType;
  alt?: string;
};

/** A {@link MediaRef} as it leaves the API, with the derived public URL. */
export type ResolvedMediaRef = MediaRef & {
  url: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMediaType(value: unknown): value is MediaType {
  return (Object.values(MediaType) as unknown[]).includes(value);
}

function isMediaRef(value: unknown): value is MediaRef {
  if (!isRecord(value) || typeof value.key !== "string" || value.key === "") {
    return false;
  }

  return value.mediaType !== undefined && isMediaType(value.mediaType);
}

/**
 * Collects every distinct media ref anywhere in a payload, keeping the whole
 * ref so callers can branch on `mediaType` rather than re-deriving it from the
 * key's extension.
 *
 * Deduplicated by key — a `Set<MediaRef>` would not have, since every ref in a
 * payload is a distinct object. The first ref wins.
 */
export function collectMediaRefs(data: unknown): MediaRef[] {
  const refs = new Map<string, MediaRef>();

  const visit = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (isMediaRef(value)) {
      if (!refs.has(value.key)) {
        refs.set(value.key, value);
      }
      return;
    }

    if (isRecord(value)) {
      Object.values(value).forEach(visit);
    }
  };

  visit(data);

  return [...refs.values()];
}

/**
 * The keys of {@link collectMediaRefs} — a projection, not a second walk.
 *
 * Used to work out which R2 objects a section owns, so deletes can prune only
 * the objects no remaining section still points at. Already deduplicated,
 * because the refs are.
 */
export function collectMediaKeys(data: unknown): string[] {
  return collectMediaRefs(data).map((ref) => ref.key);
}

/**
 * Returns a deep copy of the payload with a `url` added next to every media
 * key, mirroring how `WishService.toResponse` turns `imageKey` into `imageUrl`.
 *
 * The input is never mutated — callers pass entity payloads straight from the
 * repository.
 */
export function resolveMediaRefs<T>(
  data: T,
  resolveUrl: (key: string) => string | null,
): T {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(visit);
    }

    if (isMediaRef(value)) {
      return {
        ...value,
        url: resolveUrl(value.key),
      } satisfies ResolvedMediaRef;
    }

    if (isRecord(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, nested]) => [key, visit(nested)]),
      );
    }

    return value;
  };

  return visit(data) as T;
}
