import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { updateGlobalConfig } from "nestjs-paginate";
import { AppModule } from "./app.module";
import { paginationConstants } from "./libs/constants/pagination.constants";

function corsOrigins(): string[] {
  const configured = process.env.CORS_ORIGIN ?? "http://localhost:3000";

  return configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Behind a managed platform (Railway, Vercel, Fly) TLS terminates at the
  // edge and every request arrives from the proxy's address. Without this,
  // ThrottlerGuard buckets the whole internet into one IP and the 4-per-minute
  // wish upload limit becomes a global limit. `1` = trust exactly one hop.
  if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
  }

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
  });

  updateGlobalConfig({
    defaultOrigin: undefined,
    defaultLimit: paginationConstants.ITEM_PER_PAGE,
    defaultMaxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
  });

  await app.listen(
    process.env.PORT ?? process.env.BACKEND_PORT ?? 3001,
    "0.0.0.0",
  );
}

bootstrap();
