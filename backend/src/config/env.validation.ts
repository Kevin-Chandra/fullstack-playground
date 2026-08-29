import * as z from "zod";

/**
 * Env values are always strings, so a boolean has to be spelled out. Rejecting
 * anything but the two literals matters more than it looks: a typo that
 * silently reads as `false` is exactly how a database connection ends up
 * without TLS.
 */
const booleanFromEnv = (defaultValue: "true" | "false") =>
  z
    .enum(["true", "false"])
    .default(defaultValue)
    .transform((value) => value === "true");

const envSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_BUCKET_NAME: z.string().min(1),
  CLOUDFLARE_PUBLIC_URL: z
    .url("must be a valid URL")
    .refine((value) => !value.endsWith("/"), "must not have a trailing slash"),
  DATABASE_SSL: booleanFromEnv("false"),
  DATABASE_SSL_REJECT_UNAUTHORIZED: booleanFromEnv("true"),
  DATABASE_SSL_CA: z.string().min(1).optional(),
  DATABASE_MIGRATIONS_RUN: booleanFromEnv("true"),
});

/**
 * An unset NODE_ENV counts as production.
 *
 * The value is absent far more often by accident than on purpose, and every
 * decision it feeds — schema sync, transport security — is safer read the
 * strict way when nobody said otherwise.
 */
export function isProductionEnv(nodeEnv: string | undefined): boolean {
  return (nodeEnv ?? "production") === "production";
}

/**
 * Fails the application at boot rather than on the first upload request.
 *
 * The returned object must carry every variable, not just the parsed ones:
 * ConfigModule uses this return value as its config source, so narrowing it
 * here would drop POSTGRES_*, JWT_*, and friends.
 */
export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${details}`);
  }

  /**
   * `DATABASE_SSL` defaults to off, which is right for the local container and
   * wrong for anything with a real database behind it. Defaulting silently
   * either way is the failure mode worth avoiding, so production has to say
   * which it is.
   */
  if (
    isProductionEnv(config.NODE_ENV as string | undefined) &&
    config.DATABASE_SSL === undefined
  ) {
    throw new Error(
      "Invalid environment variables:\n" +
        "  - DATABASE_SSL: must be set explicitly ('true' or 'false') when NODE_ENV is production",
    );
  }

  return { ...config, ...result.data };
}
