import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateBlockedAppDto } from './dto/create-blocked-app.dto';
import { UpdateBlockedAppDto } from './dto/update-blocked-app.dto';

@Injectable()
export class BlockedAppsService {
  constructor(private readonly prisma: PrismaService) {}

  // Cadastra um aplicativo na lista do usuário.
  async create(userId: number, createBlockedAppDto: CreateBlockedAppDto) {
    const existingApp = await this.prisma.blockedApp.findUnique({
      where: {
        userId_appIdentifier: {
          userId,
          appIdentifier: createBlockedAppDto.appIdentifier,
        },
      },
    });

    if (existingApp) {
      throw new ConflictException('Esse aplicativo já está cadastrado.');
    }

    return this.prisma.blockedApp.create({
      data: {
        ...createBlockedAppDto,
        userId,
      },
    });
  }

  // Lista os aplicativos cadastrados pelo usuário.
  async findAll(userId: number) {
    return this.prisma.blockedApp.findMany({
      where: {
        userId,
      },
      orderBy: {
        appName: 'asc',
      },
    });
  }

  // Atualiza o estado de um aplicativo do usuário.
  async update(
    userId: number,
    id: number,
    updateBlockedAppDto: UpdateBlockedAppDto,
  ) {
    const existingApp = await this.prisma.blockedApp.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingApp) {
      throw new NotFoundException('Aplicativo não encontrado.');
    }

    return this.prisma.blockedApp.update({
      where: {
        id,
      },
      data: {
        isEnabled: updateBlockedAppDto.isEnabled,
      },
    });
  }

  // Remove um aplicativo da lista do usuário.
  async remove(userId: number, id: number) {
    const existingApp = await this.prisma.blockedApp.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingApp) {
      throw new NotFoundException('Aplicativo não encontrado.');
    }

    return this.prisma.blockedApp.delete({
      where: {
        id,
      },
    });
  }
}
