"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const vocabulary_module_1 = require("./vocabulary/vocabulary.module");
const grammar_module_1 = require("./grammar/grammar.module");
const listening_module_1 = require("./listening/listening.module");
const conversation_module_1 = require("./conversation/conversation.module");
const progress_module_1 = require("./progress/progress.module");
const auth_module_1 = require("./auth/auth.module");
const pronunciation_module_1 = require("./pronunciation/pronunciation.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            vocabulary_module_1.VocabularyModule,
            grammar_module_1.GrammarModule,
            listening_module_1.ListeningModule,
            conversation_module_1.ConversationModule,
            progress_module_1.ProgressModule,
            auth_module_1.AuthModule,
            pronunciation_module_1.PronunciationModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map