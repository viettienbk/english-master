import { PrismaService } from '../prisma/prisma.service';
export declare class ListeningService {
    private prisma;
    constructor(prisma: PrismaService);
    getLessons(level?: string): Promise<{
        id: string;
        createdAt: Date;
        audioUrl: string;
        title: string;
        titleVi: string | null;
        level: string;
        transcript: string;
        blanks: string;
        translation: string | null;
        order: number;
    }[]>;
    getLessonById(id: string): Promise<{
        id: string;
        createdAt: Date;
        audioUrl: string;
        title: string;
        titleVi: string | null;
        level: string;
        transcript: string;
        blanks: string;
        translation: string | null;
        order: number;
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
