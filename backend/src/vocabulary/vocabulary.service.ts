import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VocabularyService {
  constructor(private prisma: PrismaService) {}

  async getTopics(level?: string) {
    const where = level ? { level } : {};
    return this.prisma.vocabularyTopic.findMany({
      where,
      include: { _count: { select: { words: true } } },
      orderBy: { order: 'asc' },
    });
  }

  async getTopicById(id: string) {
    return this.prisma.vocabularyTopic.findUnique({
      where: { id },
      include: { words: true },
    });
  }

  async getWordsByTopicId(topicId: string) {
    return this.prisma.word.findMany({
      where: { topicId },
    });
  }

  async getWordById(id: string) {
    return this.prisma.word.findUnique({
      where: { id },
    });
  }

  async searchWords(query: string) {
    return this.prisma.word.findMany({
      where: {
        OR: [
          { word: { contains: query } },
          { definition: { contains: query } },
          { definitionVi: { contains: query } },
        ],
      },
      include: { topic: true },
      take: 20,
    });
  }
}
