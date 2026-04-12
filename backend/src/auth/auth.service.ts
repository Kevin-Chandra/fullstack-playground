import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PasswordUtil } from "../libs/utils/password.util";
import { LoginDto } from "./dto/login.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../libs/entity/user.entity";
import ms, { type StringValue as MsStringValue } from "ms";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const username = loginDto.username;
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.username = :username", { username })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("Username/password invalid or not found");
    }

    const isPasswordValid = await PasswordUtil.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { id: user.id, username: user.username };
    return await this.getTokens(payload);
  }

  async getRefreshToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOneBy({ id: +userId });
    if (!user) {
      throw new UnauthorizedException("Invalid user");
    }

    const payload = { id: user.id, username: user.username };
    const tokens = await this.getTokens(payload);

    return tokens;
  }

  private async getTokens(
    payload: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const jwtSecret = this.configService.getOrThrow<string>("JWT_SECRET");
    const refreshTokenSecret =
      this.configService.getOrThrow<string>("JWT_REFRESH_SECRET");
    const accessTokenExpiresIn = this.configService.get<string>(
      "JWT_ACCESS_TOKEN_EXPIRES_IN",
      "1h",
    );
    const refreshTokenExpiresIn = this.configService.get<string>(
      "JWT_REFRESH_TOKEN_EXPIRES_IN",
      "7d",
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: ms(accessTokenExpiresIn as MsStringValue),
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshTokenSecret,
        expiresIn: ms(refreshTokenExpiresIn as MsStringValue),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
