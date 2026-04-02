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
exports.ListeningService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const generative_ai_1 = require("@google/generative-ai");
let ListeningService = class ListeningService {
    prisma;
    genAI;
    translateCache = new Map();
    constructor(prisma) {
        this.prisma = prisma;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async translateWord(word, context) {
        const cacheKey = `${word.toLowerCase()}|${context.toLowerCase().slice(0, 80)}`;
        if (this.translateCache.has(cacheKey)) {
            return this.translateCache.get(cacheKey);
        }
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
        });
        const prompt = `Translate the English word "${word}" used in this sentence: "${context}"
Return ONLY a JSON object:
{
  "translation": "<Vietnamese translation>",
  "partOfSpeech": "<one of: danh từ | động từ | tính từ | trạng từ | giới từ | liên từ | đại từ | thán từ>"
}`;
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());
        const data = {
            translation: parsed.translation ?? word,
            partOfSpeech: parsed.partOfSpeech ?? '',
        };
        this.translateCache.set(cacheKey, data);
        return data;
    }
    async getLessons(level) {
        const where = level ? { level } : {};
        return this.prisma.listeningLesson.findMany({
            where,
            orderBy: { order: 'asc' },
        });
    }
    async getLessonById(id) {
        return this.prisma.listeningLesson.findUnique({
            where: { id },
        });
    }
    checkAnswers(blanks, userAnswers) {
        let correct = 0;
        const results = blanks.map((blank) => {
            const userAnswer = (userAnswers[blank.position] || '').trim().toLowerCase();
            const isCorrect = userAnswer === blank.answer.trim().toLowerCase();
            if (isCorrect)
                correct++;
            return {
                position: blank.position,
                correctAnswer: blank.answer,
                userAnswer: userAnswers[blank.position] || '',
                isCorrect,
            };
        });
        return {
            score: Math.round((correct / blanks.length) * 100),
            correct,
            total: blanks.length,
            results,
        };
    }
};
exports.ListeningService = ListeningService;
exports.ListeningService = ListeningService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListeningService);
//# sourceMappingURL=listening.service.js.map