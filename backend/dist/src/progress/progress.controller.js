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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressController = void 0;
const common_1 = require("@nestjs/common");
const progress_service_1 = require("./progress.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ProgressController = class ProgressController {
    progressService;
    constructor(progressService) {
        this.progressService = progressService;
    }
    updateProgress(req, wordId, quality) {
        return this.progressService.updateProgress(req.user.userId, wordId, quality);
    }
    getUserProgress(req) {
        return this.progressService.getUserProgress(req.user.userId);
    }
    getWordsToReview(req) {
        return this.progressService.getWordsToReview(req.user.userId);
    }
    updateLessonProgress(req, lessonId, lessonType, status, score) {
        return this.progressService.updateLessonProgress(req.user.userId, lessonId, lessonType, status, score);
    }
    getProfileStats(req) {
        return this.progressService.getProfileStats(req.user.userId);
    }
    getMasteredWords(req) {
        return this.progressService.getMasteredWords(req.user.userId);
    }
    getNewWords(req) {
        return this.progressService.getNewWords(req.user.userId);
    }
};
exports.ProgressController = ProgressController;
__decorate([
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('wordId')),
    __param(2, (0, common_1.Body)('quality')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "updateProgress", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getUserProgress", null);
__decorate([
    (0, common_1.Get)('review'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getWordsToReview", null);
__decorate([
    (0, common_1.Post)('lesson'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('lessonId')),
    __param(2, (0, common_1.Body)('lessonType')),
    __param(3, (0, common_1.Body)('status')),
    __param(4, (0, common_1.Body)('score')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "updateLessonProgress", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getProfileStats", null);
__decorate([
    (0, common_1.Get)('words/mastered'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getMasteredWords", null);
__decorate([
    (0, common_1.Get)('words/new'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProgressController.prototype, "getNewWords", null);
exports.ProgressController = ProgressController = __decorate([
    (0, common_1.Controller)('progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [progress_service_1.ProgressService])
], ProgressController);
//# sourceMappingURL=progress.controller.js.map