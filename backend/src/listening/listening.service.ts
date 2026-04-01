import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListeningService {
  constructor(private prisma: PrismaService) {}

  async getLessons(level?: string) {
    const where = level ? { level } : {};
    return this.prisma.listeningLesson.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async getLessonById(id: string) {
    return this.prisma.listeningLesson.findUnique({
      where: { id },
    });
  }

  checkAnswers(blanks: { position: number; answer: string }[], userAnswers: Record<number, string>) {
    let correct = 0;
    const results = blanks.map((blank) => {
      const userAnswer = (userAnswers[blank.position] || '').trim().toLowerCase();
      const isCorrect = userAnswer === blank.answer.trim().toLowerCase();
      if (isCorrect) correct++;
      return {
        position: blank.position,
        correctAnswer: blank.answer,
        userAnswer: userAnswers[blank.position] || '',
        isCorrect,
      };
    });

    return {
      score: Math.round((correct / blanks.length) * 100),
      correct,
      total: blanks.length,
      results,
    };
  }
}
