import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Tokens, UserResponse } from 'src/app/types';
import { CreateUserDto } from 'src/app/users/dto';
import { UsersService } from 'src/app/users/users.service';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('local/login')
  async login(@Req() req: Request) {
    const user = req.user as UserResponse;
    return await this.authService.login(user);
  }

  @Post('/local/signup')
  async signupLocal(@Body() body: CreateUserDto): Promise<Tokens> {
    return await this.authService.signup(body);
  }
}
