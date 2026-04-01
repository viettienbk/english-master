import { Controller, Get, Param, Query } from '@nestjs/common';
import { GrammarService } from './grammar.service';

@Controller('grammar')
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  @Get('lessons')
  getLessons(
    @Query('level') level?: string,
    @Query('category') category?: string,
  ) {
    return this.grammarService.getLessons(level, category);
  }

  @Get('lessons/:id')
  getLessonById(@Param('id') id: string) {
    return this.grammarService.getLessonById(id);
  }
}
