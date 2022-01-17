import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { MessagesHelper, RegexHelper } from 'src/app/helpers';

export class CreateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(RegexHelper.password, {
    message: MessagesHelper.PASSWORD_VALID,
  })
  password: string;
}
