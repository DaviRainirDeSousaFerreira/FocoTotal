import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';

// Define as rotas HTTP relacionadas às tarefas.
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Cadastra uma tarefa para o usuário autenticado.
  @Post()
  create(
    @Req()
    request: Request & {
      user: { userId: number; email: string };
    },
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.create(request.user.userId, createTaskDto);
  }

  // Lista as tarefas do usuário, opcionalmente filtradas por data.
  @Get()
  findAll(
    @Req()
    request: Request & {
      user: { userId: number; email: string };
    },
    @Query('date') date?: string,
  ) {
    return this.tasksService.findAll(request.user.userId, date);
  }

  // Lista as tarefas obrigatórias ainda pendentes de uma data.
  @Get('pending')
  findPending(
    @Req()
    request: Request & {
      user: { userId: number; email: string };
    },
    @Query('date') date: string,
  ) {
    return this.tasksService.findPending(request.user.userId, date);
  }

  // Marca uma tarefa como concluída.
  @Patch(':id/complete')
  complete(
    @Req()
    request: Request & {
      user: { userId: number; email: string };
    },
    @Param('id') id: string,
  ) {
    return this.tasksService.complete(request.user.userId, Number(id));
  }

  // Desfaz a conclusão de uma tarefa.
  @Patch(':id/uncomplete')
  uncomplete(
    @Req()
    request: Request & {
      user: { userId: number; email: string };
    },
    @Param('id') id: string,
  ) {
    return this.tasksService.uncomplete(request.user.userId, Number(id));
  }

  // Atualiza uma tarefa do usuário autenticado.
  @Patch(':id')
  update(
    @Req()
    request: Request & {
      user: { userId: number; email: string };
    },
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      request.user.userId,
      Number(id),
      updateTaskDto,
    );
  }

  // Exclui uma tarefa do usuário autenticado.
  @Delete(':id')
  remove(
    @Req()
    request: Request & {
      user: { userId: number; email: string };
    },
    @Param('id') id: string,
  ) {
    return this.tasksService.remove(request.user.userId, Number(id));
  }
}
