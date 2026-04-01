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

  @Post('lesson')
  updateLessonProgress(
    @Req() req: any,
    @Body('lessonId') lessonId: string,
    @Body('lessonType') lessonType: string,
    @Body('status') status: string,
    @Body('score') score?: number,
  ) {
    return this.progressService.updateLessonProgress(
      req.user.userId,
      lessonId,
      lessonType,
      status,
      score,
    );
  }

  @Get('profile')
  getProfileStats(@Req() req: any) {
    return this.progressService.getProfileStats(req.user.userId);
  }

  @Get('words/mastered')
  getMasteredWords(@Req() req: any) {
    return this.progressService.getMasteredWords(req.user.userId);
  }

  @Get('words/new')
  getNewWords(@Req() req: any) {
    return this.progressService.getNewWords(req.user.userId);
  }
}
