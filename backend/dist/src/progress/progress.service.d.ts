import { PrismaService } from '../prisma/prisma.service';
export declare class ProgressService {
    private prisma;
    constructor(prisma: PrismaService);
    calculateSM2(quality: number, previousEaseFactor: number, previousInterval: number, previousRepetitions: number): {
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReview: Date;
    };
    updateProgress(userId: string, wordId: string, quality: number): Promise<{
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
    getUserProgress(userId: string): Promise<{
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
    getWordsToReview(userId: string): Promise<({
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
