import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { DataSourceOptions } from "typeorm";

const logger = new Logger("TypeOrmConfig");

/**
 * How the driver connects: TLS or not, verified or not.
 *
 * This used to be read off NODE_ENV, which got both halves wrong at once. A
 * staging box left on NODE_ENV=development talked to its managed database in
 * cleartext, and production turned TLS on with `rejectUnauthorized: false` —
 * encryption that a man in the middle can simply terminate and re-offer,
 * because nothing checks who answered. Transport security belongs to the
 * connection, not to the build, so it is configured on its own.
 */
function resolveSsl(configService: ConfigService) {
  if (!configService.get<boolean>("DATABASE_SSL")) return false;

  const rejectUnauthorized = configService.get<boolean>(
    "DATABASE_SSL_REJECT_UNAUTHORIZED",
  );
  const ca = configService.get<string>("DATABASE_SSL_CA");

  if (!rejectUnauthorized) {
    logger.warn(
      "DATABASE_SSL_REJECT_UNAUTHORIZED=false: the database certificate is not checked, so TLS here only stops passive sniffing. Prefer leaving it true and supplying the provider's CA in DATABASE_SSL_CA.",
    );
  }

  return ca ? { rejectUnauthorized, ca } : { rejectUnauthorized };
}

/**
 * The one description of this database, shared by the running app and the
 * migration CLI.
 *
 * They have to agree on more than the host: a CLI pointed at different
 * `migrations` globs, or connecting without the TLS the app uses, generates
 * migrations for a schema nobody runs. `data-source.ts` wraps this for the CLI;
 * `typeOrmAsyncConfig` wraps it for Nest.
 */
export function dataSourceOptions(
  configService: ConfigService,
): DataSourceOptions {
  const port = configService.get<string>("POSTGRES_PORT", "5432");

  return {
    type: "postgres",
    url: configService.get<string>("DATABASE_URL") ?? undefined,
    host: configService.get<string>("POSTGRES_HOST", "localhost"),
    port: parseInt(port, 10),
    username: configService.get<string>("POSTGRES_USER", "postgres"),
    password: configService.get<string>("POSTGRES_PASSWORD", "your_password"),
    database: configService.get<string>("POSTGRES_DB", "my_project_db"),
    ssl: resolveSsl(configService),
    entities: [`${__dirname}/../libs/entity/*.entity{.ts,.js}`],
    migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
    synchronize: false,
    migrationsRun: configService.get<boolean>("DATABASE_MIGRATIONS_RUN"),
  };
}

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    ...dataSourceOptions(configService),
    /** Nest collects entities from the modules that register them. */
    autoLoadEntities: true,
  }),
};
