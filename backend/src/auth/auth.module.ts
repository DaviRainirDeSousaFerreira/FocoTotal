
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';

@Module({
  imports: [
    PrismaModule,

    // Habilita o Passport e define JWT como estratégia padrão.
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    // Configura a geração de tokens JWT.
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],

  controllers: [AuthController],

  // Disponibiliza os serviços e registra a estratégia JWT.
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
