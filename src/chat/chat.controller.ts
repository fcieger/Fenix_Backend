import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /api/chat/message
   * Envia mensagem para o chat e recebe resposta da IA
   */
  @Post('message')
  async sendMessage(
    @Request() req: any,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const userId = req.user.userId;
    const companyId = sendMessageDto.companyId || req.user?.activeCompanyId || req.user?.companyId;
    
    // Garantir que companyId está no DTO
    sendMessageDto.companyId = companyId;
    
    const response = await this.chatService.sendMessage(userId, sendMessageDto);
    
    return {
      success: true,
      data: response,
    };
  }

  /**
   * GET /api/chat/history
   * Busca histórico de conversas
   */
  @Get('history')
  async getHistory(
    @Request() req: any,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId;
    const messages = await this.chatService.getHistory(
      userId,
      companyId,
      limit ? parseInt(limit) : 50,
    );
    
    return {
      success: true,
      data: messages,
    };
  }

  /**
   * DELETE /api/chat/history
   * Limpa histórico de conversas
   */
  @Delete('history')
  async clearHistory(
    @Request() req: any,
    @Query('companyId') companyId?: string,
  ) {
    const userId = req.user.userId;
    await this.chatService.clearHistory(userId, companyId);
    
    return {
      success: true,
      message: 'Histórico limpo com sucesso',
    };
  }

  /**
   * POST /api/chat/analyze
   * Análise de dados com IA
   */
  @Post('analyze')
  async analyzeData(
    @Request() req: any,
    @Body() body: { data: any; question: string },
  ) {
    const userId = req.user.userId;
    const analysis = await this.chatService.analyzeData(
      userId,
      body.data,
      body.question,
    );
    
    return {
      success: true,
      data: { analysis },
    };
  }
}

