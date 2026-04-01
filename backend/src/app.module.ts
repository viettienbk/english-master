import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { GrammarModule } from './grammar/grammar.module';
import { ListeningModule } from './listening/listening.module';
import { ConversationModule } from './conversation/conversation.module';
import { ProgressModule } from './progress/progress.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    VocabularyModule,
    GrammarModule,
    ListeningModule,
    ConversationModule,
    ProgressModule,
    AuthModule,
  ],
})
export class AppModule {}
