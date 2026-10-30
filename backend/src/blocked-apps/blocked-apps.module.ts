import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { BlockedAppsController } from './blocked-apps.controller';
import { BlockedAppsService } from './blocked-apps.service';

@Module({
  imports: [PrismaModule],
  controllers: [BlockedAppsController],
  providers: [BlockedAppsService],
  exports: [BlockedAppsService],
})
export class BlockedAppsModule {}
