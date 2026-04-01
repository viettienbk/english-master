import { PrismaService } from '../prisma/prisma.service';
export declare class ConversationService {
    private prisma;
    private genAI;
    constructor(prisma: PrismaService);
    getTopics(): {
        id: string;
        name: string;
        nameEn: string;
        scenario: string;
    }[];
    private buildSystemPrompt;
    startConversation(topicId: string, userId?: string): Promise<{
        conversation: {
            id: string;
            userId: string | null;
            createdAt: Date;
            topic: string;
            score: number | null;
            scenario: string | null;
        };
        message: string;
    }>;
    sendMessage(conversationId: string, userMessage: string): Promise<{
        message: string;
    }>;
    getConversation(id: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            audioUrl: string | null;
            content: string;
            role: string;
            pronunciation: number | null;
            conversationId: string;
        }[];
    } & {
        id: string;
        userId: string | null;
        createdAt: Date;
        topic: string;
        score: number | null;
        scenario: string | null;
    }) | null>;
}
