import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/common.module';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly _prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this._prismaService.user.create({
      data: {
        email: createUserDto.email,
        fullname: createUserDto.fullName,
        password: createUserDto.password,
      },
    });
  }

  async findAll() {
    return this._prismaService.user.findMany({
      orderBy: { createAt: 'desc' },
    });
  }

  async findOne(userWhereInput: Prisma.UserWhereInput) {
    return this._prismaService.user.findFirst({
      where: userWhereInput,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this._prismaService.user.update({
      data: {
        email: updateUserDto.email,
        fullname: updateUserDto.fullName,
        password: updateUserDto.password,
        state: updateUserDto.state,
      },
      where: {
        id,
      },
    });
  }

  async activeOrDelete(id: string, active: boolean) {
    return await this._prismaService.user.update({
      data: {
        state: active,
      },
      where: {
        id,
      },
    });
  }
}
