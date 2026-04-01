import { Controller, Get, Param, Query } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';

@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get('topics')
  getTopics(@Query('level') level?: string) {
    return this.vocabularyService.getTopics(level);
  }

  @Get('topics/:id')
  getTopicById(@Param('id') id: string) {
    return this.vocabularyService.getTopicById(id);
  }

  @Get('topics/:id/words')
  getWordsByTopicId(@Param('id') id: string) {
    return this.vocabularyService.getWordsByTopicId(id);
  }

  @Get('words/:id')
  getWordById(@Param('id') id: string) {
    return this.vocabularyService.getWordById(id);
  }

  @Get('search')
  searchWords(@Query('q') query: string) {
    return this.vocabularyService.searchWords(query);
  }
}
