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
let ListeningService = class ListeningService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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