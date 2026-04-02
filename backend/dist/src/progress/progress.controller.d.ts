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
    updateLessonProgress(req: any, lessonId: string, lessonType: string, status: string, score?: number): Promise<{
        id: string;
        score: number | null;
        userId: string;
        lessonId: string;
        lessonType: string;
        status: string;
        lastStudied: Date;
    }>;
    getProfileStats(req: any): Promise<{
        user: {
            name: string | null;
            email: string;
            image: string | null;
            createdAt: Date;
        };
        vocabulary: {
            total: number;
            learned: number;
            mastered: number;
            learning: number;
            new: number;
            percentage: number;
        };
        ongoingLessons: ({
            details: {
                transcript: string;
                id: string;
                createdAt: Date;
                level: string;
                order: number;
                audioUrl: string;
                title: string;
                titleVi: string | null;
                blanks: string;
                translation: string | null;
            } | null;
            id: string;
            score: number | null;
            userId: string;
            lessonId: string;
            lessonType: string;
            status: string;
            lastStudied: Date;
        } | {
            details: {
                id: string;
                createdAt: Date;
                level: string;
                order: number;
                title: string;
                titleVi: string | null;
                category: string;
                content: string;
                examples: string;
                exercises: string;
            } | null;
            id: string;
            score: number | null;
            userId: string;
            lessonId: string;
            lessonType: string;
            status: string;
            lastStudied: Date;
        })[];
    }>;
    getMasteredWords(req: any): Promise<({
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
    getNewWords(req: any): Promise<{
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
    }[]>;
}
