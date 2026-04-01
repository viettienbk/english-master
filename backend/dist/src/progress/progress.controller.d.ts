import { ProgressService } from './progress.service';
export declare class ProgressController {
    private readonly progressService;
    constructor(progressService: ProgressService);
    updateProgress(req: any, wordId: string, quality: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        wordId: string;
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReview: Date;
        lastQuality: number;
    }>;
    getUserProgress(req: any): Promise<{
        stats: {
            totalWords: number;
            learnedWords: number;
            masteredWords: number;
            progressPercentage: number;
        };
        items: ({
            word: {
                id: string;
                imageUrl: string | null;
                word: string;
                phonetic: string | null;
                partOfSpeech: string;
                definition: string;
                definitionVi: string | null;
                example: string | null;
                exampleVi: string | null;
                audioUrl: string | null;
                topicId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            wordId: string;
            easeFactor: number;
            interval: number;
            repetitions: number;
            nextReview: Date;
            lastQuality: number;
        })[];
    }>;
    getWordsToReview(req: any): Promise<({
        word: {
            id: string;
            imageUrl: string | null;
            word: string;
            phonetic: string | null;
            partOfSpeech: string;
            definition: string;
            definitionVi: string | null;
            example: string | null;
            exampleVi: string | null;
            audioUrl: string | null;
            topicId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        wordId: string;
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReview: Date;
        lastQuality: number;
    })[]>;
}
