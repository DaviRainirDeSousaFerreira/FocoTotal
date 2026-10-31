import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BlockingStatusService } from './blocking-status.service';

@Controller('blocking-status')
@UseGuards(JwtAuthGuard)
export class BlockingStatusController {
  constructor(private readonly blockingStatusService: BlockingStatusService) {}

  @Get()
  getStatus(
    @Req()
    request: Request & {
      user: { userId: number; email: string };
    },
  ) {
    return this.blockingStatusService.getStatus(request.user.userId);
  }
}
