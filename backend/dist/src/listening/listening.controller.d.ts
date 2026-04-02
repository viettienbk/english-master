import { ListeningService } from './listening.service';
export declare class ListeningController {
    private readonly listeningService;
    constructor(listeningService: ListeningService);
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
    translateWord(word: string, context: string): Promise<{
        translation: string;
        partOfSpeech: string;
    }>;
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
