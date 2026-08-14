import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

/**
 * Managed Postgres (Railway, Neon, Supabase) hands out a single connection
 * string and terminates TLS with a certificate the container's trust store
 * does not recognise. `rejectUnauthorized: false` keeps the connection
 * encrypted while skipping chain verification, which is what those providers
 * document for their own clients.
 *
 * Traffic over a provider's *private* network does not require SSL, so this
 * stays opt-in rather than being inferred from NODE_ENV.
 */
function sslOptions(configService: ConfigService) {
  const enabled = configService.get<string>("POSTGRES_SSL") === "true";

  return enabled ? { rejectUnauthorized: false } : false;
}

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const ssl = sslOptions(configService);

    // A connection string wins when present: it is the only thing managed
    // providers give you, and splitting it back into parts loses the options
    // some of them append to the query string.
    const url = configService.get<string>("DATABASE_URL");

    if (url) {
      return {
        type: "postgres" as const,
        url,
        ssl,
        autoLoadEntities: true,
        synchronize: true,
      };
    }

    const host = configService.get("POSTGRES_HOST", "localhost");
    const port = configService.get("POSTGRES_PORT", "5432");
    const username = configService.get("POSTGRES_USER", "postgres");
    const password = configService.get("POSTGRES_PASSWORD", "your_password");
    const database = configService.get("POSTGRES_DB", "my_project_db");

    return {
      type: "postgres" as const,
      host,
      port: parseInt(port, 10),
      username,
      password,
      database,
      ssl,
      autoLoadEntities: true,
      synchronize: true,
    };
  },
};
