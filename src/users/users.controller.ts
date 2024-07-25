import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RequestApi } from 'src/common/common.module';
import { User as UserModel } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create User' })
  @ApiResponse({ status: 201, description: 'User' })
  @ApiResponse({ status: 500, description: 'Internal Error' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      password: await bcrypt.hash(createUserDto.password, 10),
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 201, description: 'Login' })
  @ApiResponse({ status: 500, description: 'Internal Error' })
  async login(@Body() loginDto: LoginDto) {
    let response: RequestApi;

    try {
      const user = await this.usersService.findOne({
        email: loginDto.email,
      });

      if (!user) {
        return (response = {
          error: true,
          message: `Usuario o contraseña incorrecta.`,
        });
      }

      const isMath = await bcrypt.compare(loginDto.password, user.password);

      if (!isMath) {
        return (response = {
          error: true,
          message: 'Usuario o contraseña incorrectos',
        });
      }

      return (response = {
        error: false,
        data: {
          user: user as UserModel,
          token: await this.jwtService.signAsync(user),
        },
      });
    } catch (err) {
      return (response = {
        error: true,
        message: `El usuario con email ${loginDto.email} no se ah podido loguear, porfavor intente nuevamente.`,
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get All Users' })
  @ApiResponse({ status: 200, description: 'Users' })
  @ApiResponse({ status: 500, description: 'Internal Error' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get User by Id' })
  @ApiResponse({ status: 200, description: 'User By ID' })
  @ApiResponse({ status: 500, description: 'Internal Error' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ id });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update User' })
  @ApiResponse({ status: 200, description: 'Update User' })
  @ApiResponse({ status: 500, description: 'Internal Error' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, {
      email: updateUserDto.email,
      fullName: updateUserDto.fullName,
      password: await bcrypt.hash(updateUserDto.password, 10),
      state: updateUserDto.state,
    });
  }

  @Patch('active/:id')
  @ApiOperation({ summary: 'Active User' })
  @ApiResponse({ status: 200, description: 'Active User' })
  @ApiResponse({ status: 500, description: 'Internal Error' })
  active(@Param('id') id: string) {
    return this.usersService.update(id, { state: true });
  }

  @Patch('inactive/:id')
  @ApiOperation({ summary: 'Inactive User' })
  @ApiResponse({ status: 200, description: 'Inactive User' })
  @ApiResponse({ status: 500, description: 'Internal Error' })
  inactive(@Param('id') id: string) {
    return this.usersService.update(id, { state: false });
  }
}
