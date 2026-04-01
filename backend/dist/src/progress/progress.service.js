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
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProgressService = class ProgressService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    calculateSM2(quality, previousEaseFactor, previousInterval, previousRepetitions) {
        let easeFactor = previousEaseFactor;
        let interval = 0;
        let repetitions = previousRepetitions;
        if (quality >= 3) {
            if (repetitions === 0) {
                interval = 1;
            }
            else if (repetitions === 1) {
                interval = 6;
            }
            else {
                interval = Math.round(previousInterval * easeFactor);
            }
            repetitions++;
        }
        else {
            repetitions = 0;
            interval = 1;
        }
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3)
            easeFactor = 1.3;
        return {
            easeFactor,
            interval,
            repetitions,
            nextReview: new Date(Date.now() + interval * 24 * 60 * 60 * 1000),
        };
    }
    async updateProgress(userId, wordId, quality) {
        const existing = await this.prisma.progress.findUnique({
            where: { userId_wordId: { userId, wordId } },
        });
        const previousEaseFactor = existing?.easeFactor ?? 2.5;
        const previousInterval = existing?.interval ?? 0;
        const previousRepetitions = existing?.repetitions ?? 0;
        const { easeFactor, interval, repetitions, nextReview } = this.calculateSM2(quality, previousEaseFactor, previousInterval, previousRepetitions);
        return this.prisma.progress.upsert({
            where: { userId_wordId: { userId, wordId } },
            update: {
                easeFactor,
                interval,
                repetitions,
                nextReview,
                lastQuality: quality,
            },
            create: {
                userId,
                wordId,
                easeFactor,
                interval,
                repetitions,
                nextReview,
                lastQuality: quality,
            },
        });
    }
    async getUserProgress(userId) {
        const progress = await this.prisma.progress.findMany({
            where: { userId },
            include: { word: true },
        });
        const totalWords = await this.prisma.word.count();
        const learnedWords = progress.filter((p) => p.repetitions > 0).length;
        const masteredWords = progress.filter((p) => p.repetitions >= 5).length;
        return {
            stats: {
                totalWords,
                learnedWords,
                masteredWords,
                progressPercentage: totalWords > 0 ? (learnedWords / totalWords) * 100 : 0,
            },
            items: progress,
        };
    }
    async getWordsToReview(userId) {
        return this.prisma.progress.findMany({
            where: {
                userId,
                nextReview: { lte: new Date() },
            },
            include: { word: true },
        });
    }
    async updateLessonProgress(userId, lessonId, lessonType, status, score) {
        return this.prisma.lessonProgress.upsert({
            where: {
                userId_lessonId_lessonType: { userId, lessonId, lessonType },
            },
            update: {
                status,
                score,
                lastStudied: new Date(),
            },
            create: {
                userId,
                lessonId,
                lessonType,
                status,
                score,
            },
        });
    }
    async getOngoingLessons(userId) {
        const ongoing = await this.prisma.lessonProgress.findMany({
            where: { userId, status: 'ongoing' },
            orderBy: { lastStudied: 'desc' },
        });
        const lessons = await Promise.all(ongoing.map(async (p) => {
            if (p.lessonType === 'listening') {
                const details = await this.prisma.listeningLesson.findUnique({
                    where: { id: p.lessonId },
                });
                return { ...p, details };
            }
            else {
                const details = await this.prisma.grammarLesson.findUnique({
                    where: { id: p.lessonId },
                });
                return { ...p, details };
            }
        }));
        return lessons.filter((l) => l.details);
    }
    async getProfileStats(userId) {
        const progress = await this.prisma.progress.findMany({
            where: { userId },
        });
        const totalWords = await this.prisma.word.count();
        const learnedWords = progress.filter((p) => p.repetitions > 0).length;
        const masteredWords = progress.filter((p) => p.repetitions >= 5).length;
        const learningWords = learnedWords - masteredWords;
        const newWords = totalWords - learnedWords;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true, image: true, createdAt: true },
        });
        const ongoingLessons = await this.getOngoingLessons(userId);
        return {
            user,
            vocabulary: {
                total: totalWords,
                learned: learnedWords,
                mastered: masteredWords,
                learning: learningWords,
                new: newWords,
                percentage: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0,
            },
            ongoingLessons,
        };
    }
    async getMasteredWords(userId) {
        return this.prisma.progress.findMany({
            where: { userId, repetitions: { gte: 5 } },
            include: { word: true },
        });
    }
    async getNewWords(userId, limit = 20) {
        const learnedWordIds = (await this.prisma.progress.findMany({
            where: { userId },
            select: { wordId: true },
        })).map((p) => p.wordId);
        return this.prisma.word.findMany({
            where: { id: { notIn: learnedWordIds } },
            take: limit,
        });
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map