import { ConversationService } from './conversation.service';
export declare class ConversationController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    getTopics(): any;
    startConversation(req: any, topicId: string): Promise<{
        conversation: {
            id: string;
            createdAt: Date;
            topic: string;
            scenario: string | null;
            score: number | null;
            userId: string | null;
        };
        message: string;
    }>;
    sendMessage(req: any, id: string, message: string): Promise<{
        message: string;
    }>;
    getConversation(req: any, id: string): Promise<{
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
        createdAt: Date;
        topic: string;
        scenario: string | null;
        score: number | null;
        userId: string | null;
    }>;
}
