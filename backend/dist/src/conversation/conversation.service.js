"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let ConversationService = class ConversationService {
    prisma;
    configService;
    genAI;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
    }
    getTopics() {
        return TOPICS;
    }
    buildSystemPrompt(scenario) {
        return `You are an English conversation practice partner.
The scenario is: "${scenario}"
Your role: Play the other person in this scenario (e.g., airline staff, waiter, interviewer).

Rules:
- Speak naturally but clearly at a pace suitable for English learners
- Keep your response concise (2-4 sentences max)
- Respond in English only
- If the user makes a grammar mistake, briefly correct it at the end (e.g. "💬 Correction: ...")
- ALWAYS end every single response with exactly 3 suggested phrases the learner could say next, formatted as:
💡 Suggested:
- [phrase 1]
- [phrase 2]
- [phrase 3]`;
    }
    async startConversation(topicId, userId) {
        console.log(`Starting conversation for topic: ${topicId}, user: ${userId}`);
        const topic = TOPICS.find((t) => t.id === topicId);
        if (!topic)
            throw new common_1.NotFoundException('Topic not found');
        let conversation;
        try {
            conversation = await this.prisma.conversation.create({
                data: {
                    userId: userId || null,
                    topic: topicId,
                    scenario: topic.scenario,
                },
            });
        }
        catch (dbError) {
            console.error('Database Error (startConversation):', dbError);
            throw new common_1.InternalServerErrorException(`Database error: ${dbError.message}`);
        }
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: this.buildSystemPrompt(topic.scenario),
        });
        try {
            const result = await model.generateContent('Start the conversation naturally as the person in the scenario. Greet the user and begin the interaction. Then provide 3 suggested phrases the user could say to respond.');
            const aiContent = result.response.text();
            await this.prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'assistant',
                    content: aiContent,
                },
            });
            return { conversation, message: aiContent };
        }
        catch (error) {
            console.error('Gemini API Error (startConversation):', error);
            await this.prisma.conversation.delete({ where: { id: conversation.id } }).catch(() => { });
            throw new common_1.InternalServerErrorException(`Gemini AI error: ${error.message}`);
        }
    }
    async sendMessage(conversationId, userMessage) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        const topic = TOPICS.find((t) => t.id === conversation.topic);
        const scenario = conversation.scenario || topic?.scenario || '';
        try {
            await this.prisma.message.create({
                data: { conversationId, role: 'user', content: userMessage },
            });
        }
        catch (dbError) {
            console.error('Database Error (sendMessage - user message):', dbError);
            throw new common_1.InternalServerErrorException(`Database error saving user message: ${dbError.message}`);
        }
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: this.buildSystemPrompt(scenario),
            generationConfig: { temperature: 0.8 },
        });
        const history = conversation.messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
        try {
            const chat = model.startChat({ history });
            const result = await chat.sendMessage(userMessage);
            const aiContent = result.response.text();
            await this.prisma.message.create({
                data: { conversationId, role: 'assistant', content: aiContent },
            });
            return { message: aiContent };
        }
        catch (error) {
            console.error('Gemini API Error (sendMessage):', error);
            throw new common_1.InternalServerErrorException(`Gemini AI error: ${error.message}`);
        }
    }
    async getConversation(id) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        return conversation;
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map