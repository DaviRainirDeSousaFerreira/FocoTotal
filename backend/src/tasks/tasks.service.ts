import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

// Contém as regras de negócio relacionadas às tarefas.
@Injectable()
export class TasksService {
  // O NestJS fornece o PrismaService por injeção de dependência.
  constructor(private readonly prisma: PrismaService) {}

  // Cadastra uma tarefa para o usuário autenticado.
  async create(userId: number, createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        scheduledFor: new Date(createTaskDto.scheduledFor),
        isMandatory: createTaskDto.isMandatory ?? true,

        // Vincula a tarefa ao usuário autenticado.
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  // Lista as tarefas do usuário, com filtro opcional por data
  // e informação sobre a conclusão de cada tarefa.
  async findAll(userId: number, date?: string) {
    // Monta o filtro para garantir que cada usuário veja
    // somente as próprias tarefas.
    const where: {
      userId: number;
      scheduledFor?: {
        gte: Date;
        lt: Date;
      };
    } = {
      userId,
    };

    // Se uma data foi informada, filtra o dia inteiro.
    if (date) {
      const inicio = new Date(`${date}T00:00:00.000Z`);

      // Rejeita datas que não possam ser interpretadas.
      if (Number.isNaN(inicio.getTime())) {
        throw new BadRequestException('Data inválida.');
      }

      const fim = new Date(inicio);
      fim.setUTCDate(fim.getUTCDate() + 1);

      where.scheduledFor = {
        gte: inicio,
        lt: fim,
      };
    }

    // Busca as tarefas e a conclusão mais recente de cada uma.
    const tarefas = await this.prisma.task.findMany({
      where,
      orderBy: {
        scheduledFor: 'asc',
      },
      include: {
        completions: {
          orderBy: {
            completedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    // Adiciona o estado da conclusão à resposta da API.
    return tarefas.map(({ completions, ...tarefa }) => ({
      ...tarefa,
      isCompleted: completions.length > 0,
      completedAt: completions[0]?.completedAt ?? null,
    }));
  }

  // Busca tarefas obrigatórias e não concluídas de uma data.
  async findPending(userId: number, date: string) {
    // Confirma que a data foi informada no formato AAAA-MM-DD.
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException(
        'Informe uma data válida no formato AAAA-MM-DD.',
      );
    }

    // Define o início do dia em UTC.
    const inicio = new Date(`${date}T00:00:00.000Z`);

    // Verifica também se a data existe no calendário.
    if (
      Number.isNaN(inicio.getTime()) ||
      inicio.toISOString().slice(0, 10) !== date
    ) {
      throw new BadRequestException('Data inválida.');
    }

    // Define o início do dia seguinte, sem incluir esse instante.
    const fim = new Date(inicio);
    fim.setUTCDate(fim.getUTCDate() + 1);

    // Busca somente tarefas obrigatórias ainda não concluídas.
    return this.prisma.task.findMany({
      where: {
        userId,
        isMandatory: true,
        scheduledFor: {
          gte: inicio,
          lt: fim,
        },
        completions: {
          none: {},
        },
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });
  }

  // Procura uma tarefa específica, respeitando seu proprietário.
  async findOne(userId: number, taskId: number) {
    const tarefa = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!tarefa) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    return tarefa;
  }

  // Atualiza uma tarefa pertencente ao usuário autenticado.
  async update(userId: number, taskId: number, updateTaskDto: UpdateTaskDto) {
    // Confirma que a tarefa existe e pertence ao usuário.
    await this.findOne(userId, taskId);

    // Monta somente os campos que foram enviados.
    const data = {
      ...updateTaskDto,
      ...(updateTaskDto.scheduledFor !== undefined && {
        scheduledFor: new Date(updateTaskDto.scheduledFor),
      }),
    };

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data,
    });
  }

  // Exclui uma tarefa pertencente ao usuário autenticado.
  async remove(userId: number, taskId: number) {
    // Confirma que a tarefa existe e pertence ao usuário.
    await this.findOne(userId, taskId);

    // Exclui a tarefa do banco de dados.
    // As conclusões relacionadas são excluídas em cascata.
    return this.prisma.task.delete({
      where: {
        id: taskId,
      },
    });
  }

  // Marca uma tarefa como concluída.
  async complete(userId: number, taskId: number) {
    // Confirma que a tarefa existe e pertence ao usuário autenticado.
    await this.findOne(userId, taskId);

    // Verifica se a tarefa já foi concluída.
    const conclusaoExistente = await this.prisma.taskCompletion.findFirst({
      where: {
        taskId,
      },
    });

    // Evita registrar a mesma conclusão novamente.
    if (conclusaoExistente) {
      return {
        message: 'A tarefa já está concluída.',
        isCompleted: true,
      };
    }

    // Registra a conclusão no banco de dados.
    await this.prisma.taskCompletion.create({
      data: {
        taskId,
      },
    });

    return {
      message: 'Tarefa concluída com sucesso.',
      isCompleted: true,
    };
  }

  // Desfaz a conclusão de uma tarefa.
  async uncomplete(userId: number, taskId: number) {
    // Confirma que a tarefa existe e pertence ao usuário autenticado.
    await this.findOne(userId, taskId);

    // Remove o registro de conclusão da tarefa.
    await this.prisma.taskCompletion.deleteMany({
      where: {
        taskId,
      },
    });

    return {
      message: 'Conclusão desfeita com sucesso.',
      isCompleted: false,
    };
  }
}
