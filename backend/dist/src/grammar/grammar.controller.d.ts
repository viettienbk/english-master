import { GrammarService } from './grammar.service';
export declare class GrammarController {
    private readonly grammarService;
    constructor(grammarService: GrammarService);
    getLessons(level?: string, category?: string): Promise<{
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
    }[]>;
    getLessonById(id: string): Promise<{
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
    } | null>;
}
