import { ListeningService } from './listening.service';
export declare class ListeningController {
    private readonly listeningService;
    constructor(listeningService: ListeningService);
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
    checkAnswers(id: string, body: {
        answers: Record<number, string>;
    }): Promise<{
        score: number;
        correct: number;
        total: number;
        results: {
            position: number;
            correctAnswer: string;
            userAnswer: string;
            isCorrect: boolean;
        }[];
    } | {
        error: string;
    }>;
}
