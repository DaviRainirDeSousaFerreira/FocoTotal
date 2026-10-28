
import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // Lista os usuários cadastrados, sem expor as senhas.
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Recebe os dados e solicita o cadastro ao service.
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
