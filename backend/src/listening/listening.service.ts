import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class ListeningService {
  private readonly genAI: GoogleGenerativeAI;
  // In-memory cache: "word|context" → result
  private readonly translateCache = new Map<string, { translation: string; partOfSpeech: string }>();

  constructor(private prisma: PrismaService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  async translateWord(word: string, context: string): Promise<{ translation: string; partOfSpeech: string }> {
    const cacheKey = `${word.toLowerCase()}|${context.toLowerCase().slice(0, 80)}`;
    if (this.translateCache.has(cacheKey)) {
      return this.translateCache.get(cacheKey)!;
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
    });

    const prompt = `Translate the English word "${word}" used in this sentence: "${context}"
Return ONLY a JSON object:
{
  "translation": "<Vietnamese translation>",
  "partOfSpeech": "<one of: danh từ | động từ | tính từ | trạng từ | giới từ | liên từ | đại từ | thán từ>"
}`;

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    const data = {
      translation: parsed.translation ?? word,
      partOfSpeech: parsed.partOfSpeech ?? '',
    };

    this.translateCache.set(cacheKey, data);
    return data;
  }

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
