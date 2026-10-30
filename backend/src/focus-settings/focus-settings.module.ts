import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { FocusSettingsController } from './focus-settings.controller';
import { FocusSettingsService } from './focus-settings.service';

@Module({
  imports: [PrismaModule],
  controllers: [FocusSettingsController],
  providers: [FocusSettingsService],
  exports: [FocusSettingsService],
})
export class FocusSettingsModule {}
