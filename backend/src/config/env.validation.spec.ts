import { validateEnv } from "./env.validation";

const required = {
  CLOUDFLARE_ACCOUNT_ID: "account",
  CLOUDFLARE_ACCESS_KEY_ID: "key",
  CLOUDFLARE_SECRET_ACCESS_KEY: "secret",
  CLOUDFLARE_BUCKET_NAME: "bucket",
  CLOUDFLARE_PUBLIC_URL: "https://cdn.test",
};

describe("validateEnv", () => {
  it("turns the ssl flags into booleans", () => {
    const config = validateEnv({
      ...required,
      DATABASE_SSL: "true",
      DATABASE_SSL_REJECT_UNAUTHORIZED: "false",
    });

    expect(config.DATABASE_SSL).toBe(true);
    expect(config.DATABASE_SSL_REJECT_UNAUTHORIZED).toBe(false);
  });

  it("defaults to no TLS but full verification once it is on", () => {
    const config = validateEnv({ ...required, NODE_ENV: "development" });

    expect(config.DATABASE_SSL).toBe(false);
    expect(config.DATABASE_SSL_REJECT_UNAUTHORIZED).toBe(true);
  });

  /** A value that is neither literal would otherwise read as `false`. */
  it("refuses a flag that is not exactly true or false", () => {
    expect(() => validateEnv({ ...required, DATABASE_SSL: "yes" })).toThrow(
      /DATABASE_SSL/,
    );
  });

  /**
   * The default is off, which is right locally and wrong for a real database.
   * Production has to say which it wants rather than inherit the local answer.
   */
  it("requires DATABASE_SSL to be explicit in production", () => {
    expect(() => validateEnv({ ...required, NODE_ENV: "production" })).toThrow(
      /DATABASE_SSL/,
    );
    expect(() => validateEnv({ ...required })).toThrow(/DATABASE_SSL/);
    expect(() =>
      validateEnv({
        ...required,
        NODE_ENV: "production",
        DATABASE_SSL: "false",
      }),
    ).not.toThrow();
  });

  it("keeps variables it does not parse", () => {
    const config = validateEnv({
      ...required,
      NODE_ENV: "development",
      JWT_SECRET: "shh",
    });

    expect(config).toMatchObject({ JWT_SECRET: "shh" });
  });
});
