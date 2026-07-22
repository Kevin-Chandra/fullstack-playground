import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Res,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CookieOptions, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginUserId } from "../decorators/user-details-decorator";
import { RefreshGuard } from "../guards/refresh.guard";
import { JwtGuard } from "../guards/jwt.guard";
import ms, { type StringValue } from "ms";

@Controller("auth")
export class AuthController {
  private readonly accessTokenMaxAge: number;
  private readonly refreshTokenMaxAge: number;
  private readonly cookieSecure: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenMaxAge = ms(
      this.configService.get<string>(
        "JWT_ACCESS_TOKEN_EXPIRES_IN",
        "1d",
      ) as StringValue,
    );
    this.refreshTokenMaxAge = ms(
      this.configService.get<string>(
        "JWT_REFRESH_TOKEN_EXPIRES_IN",
        "7d",
      ) as StringValue,
    );
    this.cookieSecure =
      this.configService.get<string>("COOKIE_SECURE") === "true";
  }

  private sessionCookieOptions(maxAge: number): CookieOptions {
    return {
      signed: true,
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: "strict",
      maxAge,
    };
  }

  private clearCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: "strict",
    };
  }

  @Post("login")
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie(
      "access_token",
      accessToken,
      this.sessionCookieOptions(this.accessTokenMaxAge),
    );
    res.cookie(
      "refresh_token",
      refreshToken,
      this.sessionCookieOptions(this.refreshTokenMaxAge),
    );

    res.status(HttpStatus.OK).send();
  }

  @Get("refresh")
  @UseGuards(RefreshGuard)
  async refreshToken(
    @LoginUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.getRefreshToken(userId);

    res.cookie(
      "access_token",
      accessToken,
      this.sessionCookieOptions(this.accessTokenMaxAge),
    );
    res.cookie(
      "refresh_token",
      refreshToken,
      this.sessionCookieOptions(this.refreshTokenMaxAge),
    );

    res.status(HttpStatus.OK).send();
  }

  @Get("me")
  @UseGuards(JwtGuard)
  async me(@LoginUserId() userId: string) {
    return this.authService.getProfile(userId);
  }

  @Get("logout")
  async logOut(@Res() res: Response) {
    res.clearCookie("access_token", this.clearCookieOptions());
    res.clearCookie("refresh_token", this.clearCookieOptions());

    res.status(HttpStatus.OK).send();
  }
}
