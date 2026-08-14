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
};
