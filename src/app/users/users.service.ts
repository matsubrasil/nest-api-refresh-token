import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashData } from 'src/app/helpers';
import { Tokens } from 'src/app/types';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  /**
   *
   * @returns
   */
  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  /**
   *
   * @param email
   * @returns
   */
  async findOneOrFailEmail({ email }: { email: string }) {
    // console.log('UsersService:findOneOrFail:', id);
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });
      //console.log('UsersService:findOneOrFail:', user);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  async findOneOrFail(id: string) {
    // console.log('UsersService:findOneOrFail:', id);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      //console.log('UsersService:findOneOrFail:', user);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.ACCESS_TOKEN_KEY,
          expiresIn: 60 * 5, // 5 minutes
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.REFRESH_TOKEN_KEY,
          expiresIn: 60 * 60 * 24, // 1 day
        },
      ),
    ]);
    return { access_token: accessToken, refresh_token: refreshToken };
  }
  /**
   *
   * @param data
   * @returns
   */
  async create(data: CreateUserDto): Promise<Tokens> {
    const hasPassword = await hashData(data.password);

    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hasPassword,
    };

    const user = await this.prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    const tokens = await this.generateTokens(user.id, user.email);
    return tokens;
  }

  /**
   *
   * @param id
   * @param data
   * @returns userUpdate {id, email, firstName, lastName}
   */
  async update(id: string, data: UpdateUserDto) {
    const user = await this.findOneOrFail(id);
    const updateUser = await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
      },

      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    return updateUser;
  }

  /**
   *
   * @param id
   * @returns NO-CONTENT
   */
  async delete(id: string) {
    const user = await this.findOneOrFail(id);
    const deletedUser = await this.prisma.user.delete({
      where: {
        email: user.email,
      },
    });
    if (!deletedUser) {
      throw new InternalServerErrorException('Delete failed');
    }
    return null;
  }
}
