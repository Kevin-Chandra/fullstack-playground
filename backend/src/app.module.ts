import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { validateEnv } from "./config/env.validation";
import { typeOrmAsyncConfig } from "./config/typeorm.config";
import { GuestModule } from "./guest/guest.module";
import { throttlerConstants } from "./libs/constants/throttler.constants";
import { MediaModule } from "./media/media.module";
import { PageConfigsModule } from "./page-configs/page-configs.module";
import { PagePublicationModule } from "./page-publication/page-publication.module";
import { PageModule } from "./page/page.module";
import { RsvpModule } from "./rsvp/rsvp.module";
import { UserModule } from "./user/user.module";
import { WishModule } from "./wish/wish.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: throttlerConstants.DEFAULT_TTL_MS,
        limit: throttlerConstants.DEFAULT_LIMIT,
      },
    ]),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    WishModule,
    UserModule,
    AuthModule,
    GuestModule,
    RsvpModule,
    MediaModule,
    PageModule,
    PageConfigsModule,
    PagePublicationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
