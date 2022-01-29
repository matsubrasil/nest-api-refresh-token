import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/app/users/users.service';
import { compare } from 'bcrypt';
import { Tokens, UserResponse, UserValidPassword } from 'src/app/types';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/app/users/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   * @param data: CreateUserDto
   * @return tokens {access_token, refresh_token}
   * @description add user with crypt password and refresh token
   */
  async signup(data: CreateUserDto): Promise<Tokens> {
    const user = await this.usersService.create(data);
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshTokenHashUser(
      user.id,
      tokens.refresh_token,
    );

    return tokens;
  }

  /**
   * @param user
   * @returns Promise<tokens {access_token, refresh_token}>
   * @description verify user, if Ok return tokens
   */
  async login(user: UserResponse): Promise<Tokens> {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshTokenHashUser(
      user.id,
      tokens.refresh_token,
    );

    return tokens;
  }

  /**
   *
   * @param user
   * @returns
   */
  async logout(email: string): Promise<void> {
    return await this.usersService.clearRefreshToken(email);
  }

  async refresh() {
    return null;
  }

  /**
   *
   * @param userId
   * @param email
   * @returns object { access token, refresh token }
   * @description generate access token and refresh token
   */
  async generateTokens(userId: string, email: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.ACCESS_TOKEN_KEY,
          expiresIn: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.REFRESH_TOKEN_KEY,
          expiresIn: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN),
        },
      ),
    ]);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  /**
   * @param email
   * @param password
   * @returns {{id: number, email: string}}
   */
  async validateUser(email: string, password: string): Promise<UserResponse> {
    let user: UserValidPassword;
    try {
      user = await this.usersService.findOneOrFailEmail({ email });
      // console.log('AuthService: validateUser: user', user);
    } catch (error) {
      return null;
    }

    const isPasswordValid = await compare(password, user.password);
    // console.log('AuthService: validateUser: isPasswordValid', isPasswordValid);
    if (!isPasswordValid) {
      return null;
    }
    const data = { id: user.id, email: user.email };
    return data;
  }
}
