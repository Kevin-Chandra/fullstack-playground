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
import type { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { LoginUserId } from "../decorators/user-details-decorator";
import { RefreshGuard } from "../guards/refresh.guard";
import ms, { type StringValue } from "ms";

@Controller("auth")
export class AuthController {
  private readonly accessTokenMaxAge: number;
  private readonly refreshTokenMaxAge: number;

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
  }

  @Post("login")
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginDto);

    res.cookie("access_token", accessToken, {
      signed: true,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: this.accessTokenMaxAge,
    });
    res.cookie("refresh_token", refreshToken, {
      signed: true,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: this.refreshTokenMaxAge,
    });

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

    res.cookie("access_token", accessToken, {
      signed: true,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: this.accessTokenMaxAge,
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: this.refreshTokenMaxAge,
    });

    res.status(HttpStatus.OK).send();
  }

  @Get("logout")
  async logOut(@Res() res: Response) {
    res.clearCookie("access_token", { httpOnly: true, sameSite: "strict" });
    res.clearCookie("refresh_token", { httpOnly: true, sameSite: "strict" });

    res.status(HttpStatus.OK).send();
  }
}
