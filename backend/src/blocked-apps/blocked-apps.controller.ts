import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlockedAppsService } from './blocked-apps.service';

import { CreateBlockedAppDto } from './dto/create-blocked-app.dto';
import { UpdateBlockedAppDto } from './dto/update-blocked-app.dto';

// Define o formato dos dados recebidos do JWT.
interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('blocked-apps')
@UseGuards(JwtAuthGuard)
export class BlockedAppsController {
  constructor(private readonly blockedAppsService: BlockedAppsService) {}

  // Cadastra um aplicativo na lista do usuário autenticado.
  @Post()
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() createBlockedAppDto: CreateBlockedAppDto,
  ) {
    const userId = request.user.userId;

    return this.blockedAppsService.create(userId, createBlockedAppDto);
  }

  // Lista os aplicativos cadastrados pelo usuário autenticado.
  @Get()
  async findAll(@Req() request: AuthenticatedRequest) {
    const userId = request.user.userId;

    return this.blockedAppsService.findAll(userId);
  }

  // Ativa ou desativa um aplicativo do usuário autenticado.
  @Patch(':id')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBlockedAppDto: UpdateBlockedAppDto,
  ) {
    const userId = request.user.userId;

    return this.blockedAppsService.update(userId, id, updateBlockedAppDto);
  }

  // Remove um aplicativo da lista do usuário autenticado.
  @Delete(':id')
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = request.user.userId;

    return this.blockedAppsService.remove(userId, id);
  }
}
