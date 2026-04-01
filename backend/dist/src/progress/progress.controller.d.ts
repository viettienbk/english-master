import { ProgressService } from './progress.service';
export declare class ProgressController {
    private readonly progressService;
    constructor(progressService: ProgressService);
    updateProgress(req: any, wordId: string, quality: number): Promise<{
        id: string;
        userId: string;
        wordId: string;
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReview: Date;
        lastQuality: number;
        createdAt: Date;
        updatedAt: Date;
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
                word: string;
                phonetic: string | null;
                partOfSpeech: string;
                definition: string;
                definitionVi: string | null;
                example: string | null;
                exampleVi: string | null;
                imageUrl: string | null;
                audioUrl: string | null;
                topicId: string;
            };
        } & {
            id: string;
            userId: string;
            wordId: string;
            easeFactor: number;
            interval: number;
            repetitions: number;
            nextReview: Date;
            lastQuality: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
    }>;
    getWordsToReview(req: any): Promise<({
        word: {
            id: string;
            word: string;
            phonetic: string | null;
            partOfSpeech: string;
            definition: string;
            definitionVi: string | null;
            example: string | null;
            exampleVi: string | null;
            imageUrl: string | null;
            audioUrl: string | null;
            topicId: string;
        };
    } & {
        id: string;
        userId: string;
        wordId: string;
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReview: Date;
        lastQuality: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateLessonProgress(req: any, lessonId: string, lessonType: string, status: string, score?: number): Promise<{
        id: string;
        userId: string;
        lessonId: string;
        lessonType: string;
        status: string;
        score: number | null;
        lastStudied: Date;
    }>;
    getProfileStats(req: any): Promise<{
        user: {
            createdAt: Date;
            name: string | null;
            email: string;
            image: string | null;
        } | null;
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
            } | null;
            id: string;
            userId: string;
            lessonId: string;
            lessonType: string;
            status: string;
            score: number | null;
            lastStudied: Date;
        } | {
            details: {
                id: string;
                createdAt: Date;
                title: string;
                titleVi: string | null;
                level: string;
                order: number;
                category: string;
                content: string;
                examples: string;
                exercises: string;
            } | null;
            id: string;
            userId: string;
            lessonId: string;
            lessonType: string;
            status: string;
            score: number | null;
            lastStudied: Date;
        })[];
    }>;
    getMasteredWords(req: any): Promise<({
        word: {
            id: string;
            word: string;
            phonetic: string | null;
            partOfSpeech: string;
            definition: string;
            definitionVi: string | null;
            example: string | null;
            exampleVi: string | null;
            imageUrl: string | null;
            audioUrl: string | null;
            topicId: string;
        };
    } & {
        id: string;
        userId: string;
        wordId: string;
        easeFactor: number;
        interval: number;
        repetitions: number;
        nextReview: Date;
        lastQuality: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getNewWords(req: any): Promise<{
        id: string;
        word: string;
        phonetic: string | null;
        partOfSpeech: string;
        definition: string;
        definitionVi: string | null;
        example: string | null;
        exampleVi: string | null;
        imageUrl: string | null;
        audioUrl: string | null;
        topicId: string;
    }[]>;
}
