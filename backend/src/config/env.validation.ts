import * as z from "zod";

const envSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_ACCESS_KEY_ID: z.string().min(1),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_BUCKET_NAME: z.string().min(1),
  CLOUDFLARE_PUBLIC_URL: z
    .url("must be a valid URL")
    .refine((value) => !value.endsWith("/"), "must not have a trailing slash"),
});

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

  return { ...config, ...result.data };
}
