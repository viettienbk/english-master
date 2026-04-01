import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('update')
  updateProgress(
    @Req() req: any,
    @Body('wordId') wordId: string,
    @Body('quality') quality: number,
  ) {
    return this.progressService.updateProgress(req.user.userId, wordId, quality);
  }

  @Get('stats')
  getUserProgress(@Req() req: any) {
    return this.progressService.getUserProgress(req.user.userId);
  }

  @Get('review')
  getWordsToReview(@Req() req: any) {
    return this.progressService.getWordsToReview(req.user.userId);
  }
}
