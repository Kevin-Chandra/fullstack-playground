export const ImageFileConstants = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB.
  ACCEPTED_TYPE: /^image\//,
};

export const AudioFileConstants = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB.
  ACCEPTED_TYPE: /^(audio\/|video\/webm$)/,
};

export const UploadLimits = {
  MAX_FILE_SIZE_BYTES: Math.max(
    ImageFileConstants.MAX_SIZE_BYTES,
    AudioFileConstants.MAX_SIZE_BYTES,
  ),
};
