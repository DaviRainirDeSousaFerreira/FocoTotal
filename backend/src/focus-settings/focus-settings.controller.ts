import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FocusSettingsService } from './focus-settings.service';
import { UpdateFocusSettingsDto } from './dto/update-focus-settings.dto';

// Define o formato dos dados que recebemos do JWT.
interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    email: string;
  };
}

@Controller('focus-settings')
@UseGuards(JwtAuthGuard)
export class FocusSettingsController {
  constructor(private readonly focusSettingsService: FocusSettingsService) {}

  // Consulta as configurações do modo foco do usuário autenticado.
  @Get()
  async findSettings(@Req() request: AuthenticatedRequest) {
    const userId = request.user.userId;

    return this.focusSettingsService.findSettings(userId);
  }

  // Ativa ou desativa o modo foco.
  @Patch()
  async updateSettings(
    @Req() request: AuthenticatedRequest,
    @Body() updateFocusSettingsDto: UpdateFocusSettingsDto,
  ) {
    const userId = request.user.userId;

    return this.focusSettingsService.updateSettings(
      userId,
      updateFocusSettingsDto.isEnabled,
    );
  }
}
