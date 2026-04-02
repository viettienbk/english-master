import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// ... (TOPICS remains the same)

@Injectable()
export class ConversationService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  getTopics() {
    return TOPICS;
  }

  private buildSystemPrompt(scenario: string) {
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

  async startConversation(topicId: string, userId?: string) {
    console.log(`Starting conversation for topic: ${topicId}, user: ${userId}`);
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) throw new NotFoundException('Topic not found');

    let conversation;
    try {
      conversation = await this.prisma.conversation.create({
        data: {
          userId: userId || null,
          topic: topicId,
          scenario: topic.scenario,
        },
      });
    } catch (dbError) {
      console.error('Database Error (startConversation):', dbError);
      throw new InternalServerErrorException(`Database error: ${dbError.message}`);
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: this.buildSystemPrompt(topic.scenario),
    });

    try {
      const result = await model.generateContent(
        'Start the conversation naturally as the person in the scenario. Greet the user and begin the interaction. Then provide 3 suggested phrases the user could say to respond.',
      );
      const aiContent = result.response.text();

      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: 'assistant',
          content: aiContent,
        },
      });

      return { conversation, message: aiContent };
    } catch (error) {
      console.error('Gemini API Error (startConversation):', error);
      // Clean up the created conversation if AI fails
      await this.prisma.conversation.delete({ where: { id: conversation.id } }).catch(() => {});
      throw new InternalServerErrorException(`Gemini AI error: ${error.message}`);
    }
  }

  async sendMessage(conversationId: string, userMessage: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const topic = TOPICS.find((t) => t.id === conversation.topic);
    const scenario = conversation.scenario || topic?.scenario || '';

    try {
      await this.prisma.message.create({
        data: { conversationId, role: 'user', content: userMessage },
      });
    } catch (dbError) {
      console.error('Database Error (sendMessage - user message):', dbError);
      throw new InternalServerErrorException(`Database error saving user message: ${dbError.message}`);
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: this.buildSystemPrompt(scenario),
      generationConfig: { temperature: 0.8 },
    });

    // Build chat history
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
    } catch (error) {
      console.error('Gemini API Error (sendMessage):', error);
      throw new InternalServerErrorException(`Gemini AI error: ${error.message}`);
    }
  }

  async getConversation(id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }
}
