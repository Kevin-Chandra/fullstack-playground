import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { validateEnv } from "./env.validation";
import { dataSourceOptions } from "./typeorm.config";

/**
 * The DataSource the `typeorm` CLI loads, for generating and running
 * migrations.
 *
 * Nothing here is used by the running app — Nest builds its connection from
 * `typeOrmAsyncConfig`. What this file adds is the two things the app gets from
 * its framework: the env file (compose hands it to the container, but a CLI run
 * on the host has to read it) and `validateEnv`, which is what turns
 * `DATABASE_SSL="false"` into the boolean `false` rather than a truthy string.
 *
 * `dotenv` does not overwrite variables that are already set, so running inside
 * the container — where compose has already supplied them — is unaffected. It is
 * a runtime dependency rather than a dev one so that `migration:run` still
 * works against a compiled image installed with `--omit=dev`.
 */
dotenv.config({
  path: [".env", "../.development.env"],
  quiet: true,
});

const configService = new ConfigService(
  validateEnv(process.env as Record<string, unknown>),
);

export default new DataSource({
  ...dataSourceOptions(configService),
  /** The CLI decides when to run migrations; never as a side effect of connecting. */
  migrationsRun: false,
});
