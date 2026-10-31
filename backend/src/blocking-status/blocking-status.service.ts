import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlockingStatusService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(userId: number) {
    // Obtém a data atual no fuso horário de Fortaleza.
    const hoje = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Fortaleza',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());

    // Fortaleza utiliza UTC-3.
    // Portanto, a meia-noite local corresponde às 03:00 UTC.
    const inicio = new Date(`${hoje}T03:00:00.000Z`);

    // Calcula o início do próximo dia.
    const fim = new Date(inicio);
    fim.setUTCDate(fim.getUTCDate() + 1);

    // Consulta as configurações de foco.
    const configuracoes = await this.prisma.focusSettings.findUnique({
      where: { userId },
    });

    // Consulta as tarefas obrigatórias ainda não concluídas de hoje.
    const tarefasPendentes = await this.prisma.task.findMany({
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

    // Consulta somente os aplicativos que estão habilitados.
    const aplicativosAtivos = await this.prisma.blockedApp.findMany({
      where: {
        userId,
        isEnabled: true,
      },
      orderBy: {
        appName: 'asc',
      },
    });

    // Verifica as três condições necessárias.
    const modoFocoAtivo = configuracoes?.isEnabled ?? true;
    const existemTarefasPendentes = tarefasPendentes.length > 0;
    const existemAplicativosAtivos = aplicativosAtivos.length > 0;

    const deveBloquear =
      modoFocoAtivo && existemTarefasPendentes && existemAplicativosAtivos;

    return {
      shouldBlock: deveBloquear,
      date: hoje,
      conditions: {
        focusModeEnabled: modoFocoAtivo,
        hasPendingMandatoryTasks: existemTarefasPendentes,
        hasEnabledApps: existemAplicativosAtivos,
      },
      pendingTasksCount: tarefasPendentes.length,
      enabledApps: aplicativosAtivos,
    };
  }
}
