import { ConfigService } from "@nestjs/config";
import { typeOrmAsyncConfig } from "./typeorm.config";

type Env = Record<string, string | boolean | undefined>;

const optionsFor = (env: Env) => {
  const configService = {
    get: (key: string, fallback?: unknown) =>
      key in env ? env[key] : fallback,
  } as unknown as ConfigService;

  const factory = typeOrmAsyncConfig.useFactory as (
    configService: ConfigService,
  ) => {
    ssl: unknown;
    synchronize: boolean;
    migrationsRun: boolean;
    migrations: string[];
  };

  return factory(configService);
};

/**
 * `validateEnv` hands ConfigModule real booleans for these, so the factory
 * receives booleans rather than the raw "true"/"false" strings.
 */
describe("typeOrmAsyncConfig ssl", () => {
  it("connects without TLS when DATABASE_SSL is off", () => {
    expect(optionsFor({ DATABASE_SSL: false }).ssl).toBe(false);
  });

  /**
   * The previous config paired TLS with `rejectUnauthorized: false`, which
   * accepts any certificate — a man in the middle only has to offer one. On by
   * default is the whole point of turning TLS on.
   */
  it("verifies the server certificate by default", () => {
    expect(
      optionsFor({
        DATABASE_SSL: true,
        DATABASE_SSL_REJECT_UNAUTHORIZED: true,
      }).ssl,
    ).toEqual({ rejectUnauthorized: true });
  });

  it("passes a supplied CA through so verification can stay on", () => {
    expect(
      optionsFor({
        DATABASE_SSL: true,
        DATABASE_SSL_REJECT_UNAUTHORIZED: true,
        DATABASE_SSL_CA: "-----BEGIN CERTIFICATE-----",
      }).ssl,
    ).toEqual({
      rejectUnauthorized: true,
      ca: "-----BEGIN CERTIFICATE-----",
    });
  });

  it("allows verification to be waived deliberately", () => {
    expect(
      optionsFor({
        DATABASE_SSL: true,
        DATABASE_SSL_REJECT_UNAUTHORIZED: false,
      }).ssl,
    ).toEqual({ rejectUnauthorized: false });
  });

  /**
   * The point of the change: TLS is no longer a side effect of the build. A
   * production deployment can still be told not to use it, and a development
   * one can be told to.
   */
  it("does not tie TLS to NODE_ENV", () => {
    expect(
      optionsFor({ NODE_ENV: "production", DATABASE_SSL: false }).ssl,
    ).toBe(false);
    expect(
      optionsFor({
        NODE_ENV: "development",
        DATABASE_SSL: true,
        DATABASE_SSL_REJECT_UNAUTHORIZED: true,
      }).ssl,
    ).toEqual({ rejectUnauthorized: true });
  });
});

describe("typeOrmAsyncConfig schema management", () => {
  /**
   * `synchronize` was on outside production, so the schema was whatever the
   * entity files said at boot — it drops columns and rewrites types to match,
   * with no record and no way back — while production was excluded and had no
   * path to a schema change at all. Migrations are now the only mechanism, in
   * every environment.
   */
  it("never synchronizes, whatever NODE_ENV says", () => {
    expect(optionsFor({ NODE_ENV: "development" }).synchronize).toBe(false);
    expect(optionsFor({ NODE_ENV: "production" }).synchronize).toBe(false);
    expect(optionsFor({}).synchronize).toBe(false);
  });

  it("loads migrations so the CLI and the app see the same set", () => {
    expect(optionsFor({}).migrations).toEqual([
      expect.stringContaining("migrations"),
    ]);
  });

  it("leaves running them to DATABASE_MIGRATIONS_RUN", () => {
    expect(optionsFor({ DATABASE_MIGRATIONS_RUN: true }).migrationsRun).toBe(
      true,
    );
    expect(optionsFor({ DATABASE_MIGRATIONS_RUN: false }).migrationsRun).toBe(
      false,
    );
  });
});
