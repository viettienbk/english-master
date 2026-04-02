import { PrismaService } from '../prisma/prisma.service';
export declare class ListeningService {
    private prisma;
    private readonly genAI;
    private readonly translateCache;
    constructor(prisma: PrismaService);
    translateWord(word: string, context: string): Promise<{
        translation: string;
        partOfSpeech: string;
    }>;
    getLessons(level?: string): Promise<{
        id: string;
        createdAt: Date;
        level: string;
        order: number;
        audioUrl: string;
        title: string;
        titleVi: string | null;
        transcript: string;
        blanks: string;
        translation: string | null;
    }[]>;
    getLessonById(id: string): Promise<{
        id: string;
        createdAt: Date;
        level: string;
        order: number;
        audioUrl: string;
        title: string;
        titleVi: string | null;
        transcript: string;
        blanks: string;
        translation: string | null;
    } | null>;
    checkAnswers(blanks: {
        position: number;
        answer: string;
    }[], userAnswers: Record<number, string>): {
        score: number;
        correct: number;
        total: number;
        results: {
            position: number;
            correctAnswer: string;
            userAnswer: string;
            isCorrect: boolean;
        }[];
    };
}
