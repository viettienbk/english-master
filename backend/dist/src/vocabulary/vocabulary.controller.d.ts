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
        name: string;
        createdAt: Date;
        nameVi: string | null;
        description: string | null;
        level: string;
        imageUrl: string | null;
        order: number;
    })[]>;
    getTopicById(id: string): Promise<({
        words: {
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
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        nameVi: string | null;
        description: string | null;
        level: string;
        imageUrl: string | null;
        order: number;
    }) | null>;
    getWordsByTopicId(id: string): Promise<{
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
    getWordById(id: string): Promise<{
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
    } | null>;
    searchWords(query: string): Promise<({
        topic: {
            id: string;
            name: string;
            createdAt: Date;
            nameVi: string | null;
            description: string | null;
            level: string;
            imageUrl: string | null;
            order: number;
        };
    } & {
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
    })[]>;
}
