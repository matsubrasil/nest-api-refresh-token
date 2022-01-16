import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(data: CreateUserDto) {
    const user = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    };
    const newUser = await this.prisma.user.create({
      data: user,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    return newUser;
  }

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
