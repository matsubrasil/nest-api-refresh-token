import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy, RefreshTokenStrategy } from 'src/app/strategies';
import { UsersModule } from 'src/app/users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from 'src/app/strategies/local.strategy';

@Module({
  imports: [JwtModule.register({}), PassportModule, UsersModule],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    LocalStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
