import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { isProductionEnv } from "./env.validation";

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

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const url = configService.get<string>("DATABASE_URL") ?? undefined;
    const isProduction = isProductionEnv(configService.get<string>("NODE_ENV"));
    const host = configService.get<string>("POSTGRES_HOST", "localhost");
    const port = configService.get<string>("POSTGRES_PORT", "5432");
    const username = configService.get<string>("POSTGRES_USER", "postgres");
    const password = configService.get<string>(
      "POSTGRES_PASSWORD",
      "your_password",
    );
    const database = configService.get<string>("POSTGRES_DB", "my_project_db");

    return {
      type: "postgres" as const,
      host,
      url,
      port: parseInt(port, 10),
      username,
      password,
      database,
      ssl: resolveSsl(configService),
      autoLoadEntities: true,
      synchronize: !isProduction,
    };
  },
};
