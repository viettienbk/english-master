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
exports.VocabularyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VocabularyService = class VocabularyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTopics(level) {
        const where = level ? { level } : {};
        return this.prisma.vocabularyTopic.findMany({
            where,
            include: { _count: { select: { words: true } } },
            orderBy: { order: 'asc' },
        });
    }
    async getTopicById(id) {
        return this.prisma.vocabularyTopic.findUnique({
            where: { id },
            include: { words: true },
        });
    }
    async getWordsByTopicId(topicId) {
        return this.prisma.word.findMany({
            where: { topicId },
        });
    }
    async getWordById(id) {
        return this.prisma.word.findUnique({
            where: { id },
        });
    }
    async searchWords(query) {
        return this.prisma.word.findMany({
            where: {
                OR: [
                    { word: { contains: query } },
                    { definition: { contains: query } },
                    { definitionVi: { contains: query } },
                ],
            },
            include: { topic: true },
            take: 20,
        });
    }
};
exports.VocabularyService = VocabularyService;
exports.VocabularyService = VocabularyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VocabularyService);
//# sourceMappingURL=vocabulary.service.js.map