import { PrismaService } from '../prisma/prisma.service';
export declare class GrammarService {
    private prisma;
    constructor(prisma: PrismaService);
    getLessons(level?: string, category?: string): Promise<{
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
    }[]>;
    getLessonById(id: string): Promise<{
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
    } | null>;
}
