import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FocusSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Consulta as configurações de modo foco de um usuário.
  async findSettings(userId: number) {
    return this.prisma.focusSettings.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        isEnabled: true,
      },
      update: {},
    });
  }

  // Ativa ou desativa o modo foco de um usuário.
  async updateSettings(userId: number, isEnabled: boolean) {
    return this.prisma.focusSettings.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        isEnabled,
      },
      update: {
        isEnabled,
      },
    });
  }
}
