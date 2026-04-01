import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get('topics')
  getTopics() {
    return this.conversationService.getTopics();
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  startConversation(@Req() req: any, @Body('topicId') topicId: string) {
    return this.conversationService.startConversation(topicId, req.user.userId);
  }

  @Post(':id/message')
  @UseGuards(JwtAuthGuard)
  sendMessage(@Req() req: any, @Param('id') id: string, @Body('message') message: string) {
    // Note: In a real app, we should also verify that the conversation belongs to the user
    return this.conversationService.sendMessage(id, message);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getConversation(@Req() req: any, @Param('id') id: string) {
    return this.conversationService.getConversation(id);
  }
}
