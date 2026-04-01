import { VocabularyService } from './vocabulary.service';
export declare class VocabularyController {
    private readonly vocabularyService;
    constructor(vocabularyService: VocabularyService);
    getTopics(level?: string): Promise<({
        _count: {
            words: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        imageUrl: string | null;
        level: string;
        order: number;
        nameVi: string | null;
        description: string | null;
    })[]>;
    getTopicById(id: string): Promise<({
        words: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        imageUrl: string | null;
        level: string;
        order: number;
        nameVi: string | null;
        description: string | null;
    }) | null>;
    getWordsByTopicId(id: string): Promise<{
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
    getWordById(id: string): Promise<{
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
    } | null>;
    searchWords(query: string): Promise<({
        topic: {
            id: string;
            createdAt: Date;
            name: string;
            imageUrl: string | null;
            level: string;
            order: number;
            nameVi: string | null;
            description: string | null;
        };
    } & {
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
    })[]>;
}
