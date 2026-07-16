import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { updateGlobalConfig } from "nestjs-paginate";
import { paginationConstants } from "./libs/constants/pagination.constants";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });

  updateGlobalConfig({
    defaultOrigin: undefined,
    defaultLimit: paginationConstants.ITEM_PER_PAGE,
    defaultMaxLimit: paginationConstants.MAX_ITEM_PER_PAGE,
  });

  await app.listen(process.env.BACKEND_PORT ?? 3001);
}

bootstrap();
