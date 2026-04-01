import { PrismaService } from '../prisma/prisma.service';
export declare class GrammarService {
    private prisma;
    constructor(prisma: PrismaService);
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
