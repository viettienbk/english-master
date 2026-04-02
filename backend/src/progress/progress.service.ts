import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  /**
   * SM-2 Algorithm implementation
   * @param quality Quality of response (0-5)
   * @param previousEaseFactor Previous ease factor (default 2.5)
   * @param previousInterval Previous interval in days (default 0)
   * @param previousRepetitions Previous number of successful repetitions (default 0)
   */
  calculateSM2(
    quality: number,
    previousEaseFactor: number,
    previousInterval: number,
    previousRepetitions: number,
  ) {
    let easeFactor = previousEaseFactor;
    let interval = 0;
    let repetitions = previousRepetitions;

    if (quality >= 3) {
      // Success
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(previousInterval * easeFactor);
      }
      repetitions++;
    } else {
      // Failure - reset repetitions but be a bit more lenient if it was already mastered
      // If it was mastered (rep >= 5), drop to 3 so it can be re-mastered faster
      repetitions = previousRepetitions >= 5 ? 3 : 0; 
      interval = 1;
    }

    // Update ease factor: EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    return {
      easeFactor,
      interval,
      repetitions,
      nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
    };
  }

  async updateProgress(userId: string, wordId: string, quality: number) {
    const existing = await this.prisma.progress.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    const previousEaseFactor = existing?.easeFactor ?? 2.5;
    const previousInterval = existing?.interval ?? 0;
    const previousRepetitions = existing?.repetitions ?? 0;

    const { easeFactor, interval, repetitions, nextReview } = this.calculateSM2(
      quality,
      previousEaseFactor,
      previousInterval,
      previousRepetitions,
    );

    return this.prisma.progress.upsert({
      where: { userId_wordId: { userId, wordId } },
      update: {
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastQuality: quality,
      },
      create: {
        userId,
        wordId,
        easeFactor,
        interval,
        repetitions,
        nextReview,
        lastQuality: quality,
      },
    });
  }

  async getUserProgress(userId: string) {
    const progress = await this.prisma.progress.findMany({
      where: { userId },
      include: { word: true },
    });

    const totalWords = await this.prisma.word.count();
    const learnedWords = progress.filter((p) => p.repetitions > 0).length;
    const masteredWords = progress.filter((p) => p.repetitions >= 5).length;

    return {
      stats: {
        totalWords,
        learnedWords,
        masteredWords,
        progressPercentage: totalWords > 0 ? (learnedWords / totalWords) * 100 : 0,
      },
      items: progress,
    };
  }

  async getWordsToReview(userId: string) {
    return this.prisma.progress.findMany({
      where: {
        userId,
        nextReview: { lte: new Date() },
      },
      include: { word: true },
    });
  }

  async updateLessonProgress(
    userId: string,
    lessonId: string,
    lessonType: string,
    status: string,
    score?: number,
  ) {
    // Check current status
    const current = await this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId_lessonType: { userId, lessonId, lessonType } },
    });

    // If already completed and trying to set to ongoing, ignore
    if (current?.status === 'completed' && status === 'ongoing') {
      return current;
    }

    return this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId_lessonType: { userId, lessonId, lessonType },
      },
      update: {
        status,
        score: score !== undefined ? score : current?.score,
        lastStudied: new Date(),
      },
      create: {
        userId,
        lessonId,
        lessonType,
        status,
        score: score || 0,
      },
    });
  }

  async getOngoingLessons(userId: string) {
    const ongoing = await this.prisma.lessonProgress.findMany({
      where: { userId, status: 'ongoing' },
      orderBy: { lastStudied: 'desc' },
    });

    // Fetch actual lesson details
    const lessons = await Promise.all(
      ongoing.map(async (p) => {
        if (p.lessonType === 'listening') {
          const details = await this.prisma.listeningLesson.findUnique({
            where: { id: p.lessonId },
          });
          return { ...p, details };
        } else {
          const details = await this.prisma.grammarLesson.findUnique({
            where: { id: p.lessonId },
          });
          return { ...p, details };
        }
      }),
    );

    return lessons.filter((l) => l.details);
  }

  async getProfileStats(userId: string) {
    const progress = await this.prisma.progress.findMany({
      where: { userId },
    });

    const totalWords = await this.prisma.word.count();
    const learnedWords = progress.filter((p) => p.repetitions > 0).length;
    const masteredWords = progress.filter((p) => p.repetitions >= 5).length;
    const learningWords = learnedWords - masteredWords;
    const newWords = totalWords - learnedWords;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, image: true, createdAt: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const ongoingLessons = await this.getOngoingLessons(userId);

    return {
      user,
      vocabulary: {
        total: totalWords,
        learned: learnedWords,
        mastered: masteredWords,
        learning: learningWords,
        new: newWords,
        percentage: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0,
      },
      ongoingLessons,
    };
  }

  async getMasteredWords(userId: string) {
    return this.prisma.progress.findMany({
      where: { userId, repetitions: { gte: 5 } },
      include: { word: true },
    });
  }

  async getNewWords(userId: string, limit = 20) {
    const learnedWordIds = (
      await this.prisma.progress.findMany({
        where: { userId },
        select: { wordId: true },
      })
    ).map((p) => p.wordId);

    return this.prisma.word.findMany({
      where: { id: { notIn: learnedWordIds } },
      take: limit,
    });
  }
}
