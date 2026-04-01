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
exports.GrammarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GrammarService = class GrammarService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLessons(level, category) {
        const where = {};
        if (level)
            where.level = level;
        if (category)
            where.category = category;
        return this.prisma.grammarLesson.findMany({
            where,
            orderBy: { order: 'asc' },
        });
    }
    async getLessonById(id) {
        return this.prisma.grammarLesson.findUnique({
            where: { id },
        });
    }
};
exports.GrammarService = GrammarService;
exports.GrammarService = GrammarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GrammarService);
//# sourceMappingURL=grammar.service.js.map