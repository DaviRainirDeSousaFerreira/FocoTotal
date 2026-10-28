
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Verifica as credenciais e gera um token para o usuário.
  async login(email: string, password: string) {
    // Procura no banco um usuário com o e-mail informado.
    const usuario = await this.prisma.user.findUnique({
      where: { email },
    });

    // Se não encontrar, rejeita o login.
    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // Compara a senha informada com o hash salvo no banco.
    const senhaCorreta = await bcrypt.compare(
      password,
      usuario.password,
    );

    // Se a senha não corresponder, rejeita o login.
    if (!senhaCorreta) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // Informações públicas que serão incluídas no token.
    const payload = {
      sub: usuario.id,
      email: usuario.email,
    };

    // Assina o token usando a configuração do JwtModule.
    const accessToken = await this.jwtService.signAsync(payload);

    // Retorna o token e dados públicos do usuário.
    return {
      access_token: accessToken,
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
      },
    };
  }
}
