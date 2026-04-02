import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class ConversationService {
    private prisma;
    private configService;
    private genAI;
    constructor(prisma: PrismaService, configService: ConfigService);
    getTopics(): any;
    private buildSystemPrompt;
    startConversation(topicId: string, userId?: string): Promise<{
        conversation: {
            id: string;
            topic: string;
            scenario: string | null;
            score: number | null;
            createdAt: Date;
            userId: string | null;
        };
        message: string;
    }>;
    sendMessage(conversationId: string, userMessage: string): Promise<{
        message: string;
    }>;
    getConversation(id: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            conversationId: string;
            role: string;
            content: string;
            audioUrl: string | null;
            pronunciation: number | null;
        }[];
    } & {
        id: string;
        topic: string;
        scenario: string | null;
        score: number | null;
        createdAt: Date;
        userId: string | null;
    }>;
}
