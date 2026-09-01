import { MediaType } from "../types/enum/MediaType.enum";

const MB = 1024 * 1024;

/** Uploads get their own window — a large video outruns the instance default. */
export const MEDIA_UPLOAD_TIMEOUT_MS: number = 5 * 60 * 1000;

export const MEDIA_MAX_SIZE_BYTES: Record<MediaType, number> = {
  [MediaType.IMAGE]: 5 * MB,
  [MediaType.AUDIO]: 5 * MB,
  [MediaType.VIDEO]: 25 * MB,
};

/** Matches the per-type mime checks the backend applies after upload. */
export const MEDIA_ACCEPTED_MIME: Record<MediaType, RegExp> = {
  [MediaType.IMAGE]: /^image\//,
  [MediaType.AUDIO]: /^(audio\/|video\/webm$)/,
  [MediaType.VIDEO]: /^video\//,
};

/** `accept` attribute values for a file input, per type. */
export const MEDIA_ACCEPT_ATTRIBUTE: Record<MediaType, string> = {
  [MediaType.IMAGE]: "image/*",
  [MediaType.AUDIO]: "audio/*,video/webm",
  [MediaType.VIDEO]: "video/*",
};
