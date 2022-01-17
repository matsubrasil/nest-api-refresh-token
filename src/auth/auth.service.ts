import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/app/users/users.service';
import { compare } from 'bcrypt';
import { UserResponse, UserValidPassword } from 'src/app/types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   *
   * @param email
   * @param password
   * @returns {{id: number, email: string}}
   */
  async validateUser(email: string, password: string) {
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

    return { ...user, password: undefined };
  }

  /**
   *
   */
  async login(user: UserResponse) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const token = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: 60 * 5,
    });

    return {
      token,
    };
  }
}
