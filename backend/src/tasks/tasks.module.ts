import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  // Permite que o TasksService utilize o PrismaService.
  imports: [PrismaModule],

  // Registra as rotas HTTP de tarefas.
  controllers: [TasksController],

  // Registra o serviço que contém as regras de negócio.
  providers: [TasksService],
})
export class TasksModule {}
