import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { BlockingStatusController } from './blocking-status.controller';
import { BlockingStatusService } from './blocking-status.service';

@Module({
  imports: [PrismaModule],
  controllers: [BlockingStatusController],
  providers: [BlockingStatusService],
})
export class BlockingStatusModule {}
