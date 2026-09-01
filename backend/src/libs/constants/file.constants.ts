export const ImageFileConstants = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB.
  ACCEPTED_TYPE: /^image\//,
};

export const AudioFileConstants = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB.
  ACCEPTED_TYPE: /^(audio\/|video\/webm$)/,
};

export const VideoFileConstants = {
  MAX_SIZE_BYTES: 25 * 1024 * 1024, // 25 MB.
  ACCEPTED_TYPE: /^video\//,
};

export const MediaFileConstants = {
  MAX_SIZE_BYTES: Math.max(
    ImageFileConstants.MAX_SIZE_BYTES,
    AudioFileConstants.MAX_SIZE_BYTES,
    VideoFileConstants.MAX_SIZE_BYTES,
  ),
  ACCEPTED_TYPE: /^(image\/|audio\/|video\/)/,
};

export const UploadLimits = {
  MAX_FILE_SIZE_BYTES: Math.max(
    ImageFileConstants.MAX_SIZE_BYTES,
    AudioFileConstants.MAX_SIZE_BYTES,
  ),
};

export const MediaCollection = {
  /**
   * How long an uploaded object is left alone before it counts as abandoned.
   *
   * An upload the editor is still holding client-side looks exactly like one it
   * walked away from — nothing references either. This window is what tells
   * them apart, so it has to be comfortably longer than the gap between picking
   * an image and saving the draft.
   */
  UPLOAD_GRACE_MS: 60 * 60 * 1000, // 1 hour.
};

export const StoragePrefixes = {
  WISH_IMAGE: "wish/images",
  WISH_AUDIO: "wish/audios",
  HOME_PAGE: "page/home",
};

export const StorageTypePath = {
  IMAGE: "/images",
  AUDIO: "/audios",
  VIDEO: "/videos",
};
