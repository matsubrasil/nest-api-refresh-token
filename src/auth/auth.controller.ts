import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { Tokens, UserResponse } from 'src/app/types';
import { CreateUserDto } from 'src/app/users/dto';
import { UsersService } from 'src/app/users/users.service';
import { AuthService } from './auth.service';
import {
  AccessTokenGuard,
  LocalGuard,
  RefreshTokenGuard,
} from 'src/app/common/guards';
import { GetCurrentUser } from 'src/app/common/decorators';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalGuard)
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

  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  //async logout(@Req() req: Request) {
  async logout(@GetCurrentUser('email') email: string) {
    // console.log('AuthController: logout: req', req.user);
    /* req.user =  {sub: string, email:string, iat: number, exp: number}
     */
    //const user = req.user as JwtPayload;

    //return await this.authService.logout(user.email);
    console.log('AuthController: logout: ', email);
    return await this.authService.logout(email);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetCurrentUser('email') email: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    console.log('AuthController: refresh: ', email, refreshToken);
    return this.authService.refresh(email, refreshToken);
  }
}
