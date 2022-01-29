import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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
  @HttpCode(HttpStatus.CREATED)
  async login(@Req() req: Request) {
    const user = req.user as UserResponse;
    return await this.authService.login(user);
  }

  @Post('/local/signup')
  @HttpCode(HttpStatus.OK)
  async signupLocal(@Body() body: CreateUserDto): Promise<Tokens> {
    return await this.authService.signup(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    console.log('AuthController: logout: req', req.user);
    /* req.user =  {sub: string, email:string, iat: number, exp: number}
     */
    const user = {
      id: req.user['sub'],
      email: req.user['email'],
    } as UserResponse;

    return await this.authService.logout(user);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh() {
    return null;
  }
}
