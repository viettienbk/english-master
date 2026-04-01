import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { ListeningService } from './listening.service';

@Controller('listening')
export class ListeningController {
  constructor(private readonly listeningService: ListeningService) {}

  @Get('lessons')
  getLessons(@Query('level') level?: string) {
    return this.listeningService.getLessons(level);
  }

  @Get('lessons/:id')
  getLessonById(@Param('id') id: string) {
    return this.listeningService.getLessonById(id);
  }

  @Post('lessons/:id/check')
  async checkAnswers(
    @Param('id') id: string,
    @Body() body: { answers: Record<number, string> },
  ) {
    const lesson = await this.listeningService.getLessonById(id);
    if (!lesson) return { error: 'Lesson not found' };

    const blanks = JSON.parse(lesson.blanks) as { position: number; answer: string }[];
    return this.listeningService.checkAnswers(blanks, body.answers);
  }
}
