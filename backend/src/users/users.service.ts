
import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // Busca todos os usuários cadastrados.
  async findAll() {
    return this.prisma.user.findMany({
      // Nunca devolve o hash das senhas na listagem.
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  // Cadastra um novo usuário no banco de dados.
  async create(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // Verifica se já existe um usuário com esse e-mail.
    const usuarioExistente = await this.prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new ConflictException(
        'Este e-mail já está cadastrado.',
      );
    }

    // Gera um hash seguro da senha antes de armazená-la.
    const passwordHash = await bcrypt.hash(password, 12);

    // Cria o usuário no PostgreSQL.
    const usuario = await this.prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
      // Retorna somente os campos que podem ser expostos.
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return usuario;
  }
}
