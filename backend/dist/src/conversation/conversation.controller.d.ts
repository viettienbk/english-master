import { ConversationService } from './conversation.service';
export declare class ConversationController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    getTopics(): {
        id: string;
        name: string;
        nameEn: string;
        scenario: string;
    }[];
    startConversation(req: any, topicId: string): Promise<{
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
    sendMessage(req: any, id: string, message: string): Promise<{
        message: string;
    }>;
    getConversation(req: any, id: string): Promise<({
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
    }) | null>;
}
