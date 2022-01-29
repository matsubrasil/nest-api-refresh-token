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
import { RefreshJwtPayload, Tokens, UserResponse } from 'src/app/types';
import { CreateUserDto } from 'src/app/users/dto';
import { UsersService } from 'src/app/users/users.service';
import { AuthService } from './auth.service';
import { JwtPayload } from '../app/types/jwt-payload.type';

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
    // console.log('AuthController: logout: req', req.user);
    /* req.user =  {sub: string, email:string, iat: number, exp: number}
     */
    const user = req.user as JwtPayload;

    return await this.authService.logout(user.email);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    /* req.user =  {sub: string, email:string, iat: number, exp: number, refreshToken: string}
     */
    // console.log('AuthController: refresh: req', req.user);
    const user = req.user as RefreshJwtPayload;

    //console.log('AuthController: refresh: user', user);
    return this.authService.refresh(user.email, user.refreshToken);
  }
}
