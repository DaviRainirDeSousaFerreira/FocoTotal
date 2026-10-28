import { Module } from '@nestjs/common';

// Importa o módulo que disponibiliza o PrismaService.
import { PrismaModule } from '../prisma/prisma.module';

// Importa o controller responsável pelas requisições de usuários.
import { UsersController } from './users.controller';

// Importa o serviço que contém a lógica de usuários.
import { UsersService } from './users.service';

@Module({
  // Disponibiliza o PrismaService neste módulo.
  imports: [PrismaModule],

  // Registra o controller que receberá as requisições HTTP.
  controllers: [UsersController],

  // Registra o serviço que executará a lógica da aplicação.
  providers: [UsersService],
})
export class UsersModule {}