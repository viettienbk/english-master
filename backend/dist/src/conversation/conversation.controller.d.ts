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
            userId: string | null;
            createdAt: Date;
            topic: string;
            score: number | null;
            scenario: string | null;
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
