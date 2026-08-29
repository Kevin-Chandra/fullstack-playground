export const throttlerConstants = {
  /**
   * Module-level fallback. ThrottlerGuard is applied per-route rather than
   * globally, so this only covers routes that opt in without their own
   * @Throttle override.
   */
  DEFAULT_TTL_MS: 60_000,
  DEFAULT_LIMIT: 30,

  /**
   * Budget for the unauthenticated wish upload, which accepts up to 10 MB per
   * request and writes it to paid object storage.
   */
  UPLOAD_TTL_MS: 60_000,
  UPLOAD_LIMIT: 4,

  /**
   * Budget for the unauthenticated home page read. Every visitor hits it once
   * per page load, so it is far looser than the upload budget while still
   * capping a scraper.
   */
  PUBLIC_READ_TTL_MS: 60_000,
  PUBLIC_READ_LIMIT: 60,

  /**
   * Budget for authenticated media uploads. Deliberately far above
   * `UPLOAD_LIMIT`: the caller is a signed-in editor who may add a whole
   * gallery in one sitting, not an anonymous visitor.
   */
  MEDIA_UPLOAD_TTL_MS: 60_000,
  MEDIA_UPLOAD_LIMIT: 30,
};
