import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GrammarService {
  constructor(private prisma: PrismaService) {}

  async getLessons(level?: string, category?: string) {
    const where: Record<string, string> = {};
    if (level) where.level = level;
    if (category) where.category = category;

    return this.prisma.grammarLesson.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async getLessonById(id: string) {
    return this.prisma.grammarLesson.findUnique({
      where: { id },
    });
  }
}
