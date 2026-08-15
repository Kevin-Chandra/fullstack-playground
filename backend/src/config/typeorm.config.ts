import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const url = configService.get<string>("DATABASE_URL") ?? undefined;
    const isProduction =
      configService.get<string>("NODE_ENV", "production") === "production";
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
      ssl: isProduction
        ? {
          rejectUnauthorized: false,
        }
        : false,
      autoLoadEntities: true,
      synchronize: !isProduction,
    };
  },
};
