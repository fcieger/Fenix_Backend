import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatMessage } from './entities/chat-message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatToolsService } from './chat-tools.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private openai: OpenAI;
  private readonly ASSISTANT_ID = 'asst_l8O9He9PkMJwBdpUyhlnnCTc'; // Assistant treinado
  private userThreads: Map<string, string> = new Map(); // Mapeia userId -> threadId

  constructor(
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    private configService: ConfigService,
    private chatToolsService: ChatToolsService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('⚠️ OPENAI_API_KEY não configurada. Chat IA não funcionará.');
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      this.logger.log('✅ OpenAI inicializada com sucesso');
      this.logger.log(`🤖 Usando Assistant ID: ${this.ASSISTANT_ID}`);
    }
  }

  /**
   * Obtém ou cria um thread para o usuário
   */
  private async getOrCreateThread(userId: string): Promise<string> {
    // Verificar se já existe thread em memória
    const existingThread = this.userThreads.get(userId);
    if (existingThread) {
      return existingThread;
    }

    // Criar novo thread
    const thread = await this.openai.beta.threads.create();
    this.userThreads.set(userId, thread.id);
    this.logger.log(`🧵 Novo thread criado para usuário ${userId}: ${thread.id}`);
    
    return thread.id;
  }

  /**
   * Envia mensagem para o chat usando o Assistant treinado
   */
  async sendMessage(
    userId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<{ message: string; tokensUsed?: number }> {
    try {
      if (!this.openai) {
        throw new BadRequestException('OpenAI não configurada. Configure OPENAI_API_KEY.');
      }

      const { message, companyId } = sendMessageDto;
      
      this.logger.log(`💬 Mensagem recebida de usuário ${userId}`);
      this.logger.log(`🏢 Empresa ativa: ${companyId || 'NÃO INFORMADA'}`);

      // Obter ou criar thread para este usuário
      const threadId = await this.getOrCreateThread(userId);

      // Adicionar mensagem do usuário ao thread
      await this.openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content: message,
      });

      // Executar o assistant com tools dinâmicas
      this.logger.log(`🤖 Executando Assistant ${this.ASSISTANT_ID} no thread ${threadId}`);
      
      const tools = this.chatToolsService.getToolDefinitions();
      this.logger.log(`🔧 Tools disponíveis: ${tools.map(t => t.function.name).join(', ')}`);
      
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: this.ASSISTANT_ID,
        tools: tools,
      });

      // Aguardar conclusão da execução (polling)
      let runStatus = await this.openai.beta.threads.runs.retrieve(run.id, {
        thread_id: threadId,
      });
      let attempts = 0;
      const maxAttempts = 60; // 60 segundos máximo (Assistants podem demorar)

      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        // Tratar tool calls (quando IA quer chamar uma função)
        if (runStatus.status === 'requires_action') {
          this.logger.log(`🔧 IA requisitou tool calls`);
          
          const toolCalls = runStatus.required_action?.submit_tool_outputs?.tool_calls || [];
          
          const toolOutputs = await Promise.all(
            toolCalls.map(async (toolCall) => {
              this.logger.log(`📞 Chamando tool: ${toolCall.function.name}`);
              
              const args = JSON.parse(toolCall.function.arguments || '{}');
              const result = await this.chatToolsService.executeTool(
                toolCall.function.name,
                args,
                userId,
                companyId || '',
              );
              
              this.logger.log(`✅ Tool ${toolCall.function.name} executada com sucesso`);
              
              return {
                tool_call_id: toolCall.id,
                output: JSON.stringify(result),
              };
            })
          );
          
          // Submeter resultados das tools
          await this.openai.beta.threads.runs.submitToolOutputs(
            run.id,
            {
              thread_id: threadId,
              tool_outputs: toolOutputs,
            },
          );
        }
        
        if (runStatus.status === 'failed' || runStatus.status === 'cancelled' || runStatus.status === 'expired') {
          this.logger.error(`❌ Assistant falhou. Status: ${runStatus.status}`);
          this.logger.error(`❌ Detalhes do erro:`, JSON.stringify(runStatus, null, 2));
          throw new Error(`Execução do assistant falhou com status: ${runStatus.status}. Erro: ${runStatus.last_error?.message || 'Desconhecido'}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
        runStatus = await this.openai.beta.threads.runs.retrieve(run.id, {
          thread_id: threadId,
        });
        attempts++;
        this.logger.debug(`Polling ${attempts}/${maxAttempts} - Status: ${runStatus.status}`);
      }

      if (runStatus.status !== 'completed') {
        throw new Error('Timeout ao aguardar resposta do assistant');
      }

      // Buscar mensagens do thread
      const messages = await this.openai.beta.threads.messages.list(threadId, {
        limit: 1,
        order: 'desc',
      });

      const aiResponse = messages.data[0]?.content[0]?.type === 'text' 
        ? messages.data[0].content[0].text.value 
        : 'Desculpe, não consegui processar sua mensagem.';

      // Estimar tokens (não disponível na API de Assistants)
      const estimatedTokens = Math.ceil((message.length + aiResponse.length) / 4);

      // Salvar no histórico
      const chatMessage = this.chatMessageRepository.create({
        userId,
        companyId,
        userMessage: message,
        aiResponse,
        context: { threadId }, // Salvar thread ID para referência
        model: this.ASSISTANT_ID,
        tokensUsed: estimatedTokens,
      });

      await this.chatMessageRepository.save(chatMessage);

      this.logger.log(`✅ Resposta gerada - tokens estimados: ${estimatedTokens}`);

      return {
        message: aiResponse,
        tokensUsed: estimatedTokens,
      };
    } catch (error) {
      this.logger.error('❌ Erro ao enviar mensagem para OpenAI Assistant:', error);
      
      if (error.message?.includes('API key')) {
        throw new BadRequestException('Chave da OpenAI inválida ou não configurada');
      }
      
      if (error.message?.includes('assistant')) {
        throw new BadRequestException('Assistant não encontrado. Verifique o ID do assistant.');
      }
      
      throw new BadRequestException('Erro ao processar mensagem: ' + error.message);
    }
  }

  /**
   * Busca histórico de conversas do usuário
   */
  async getHistory(
    userId: string,
    companyId?: string,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    const query = this.chatMessageRepository
      .createQueryBuilder('chat')
      .where('chat.userId = :userId', { userId })
      .orderBy('chat.createdAt', 'DESC')
      .take(limit);

    if (companyId) {
      query.andWhere('chat.companyId = :companyId', { companyId });
    }

    const messages = await query.getMany();
    return messages.reverse(); // Mais antiga primeiro
  }

  /**
   * Limpa histórico de conversas do usuário
   */
  async clearHistory(userId: string, companyId?: string): Promise<void> {
    const query = this.chatMessageRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId });

    if (companyId) {
      query.andWhere('companyId = :companyId', { companyId });
    }

    await query.execute();
    this.logger.log(`🗑️ Histórico limpo para usuário ${userId}`);
  }

  /**
   * Análise de dados do sistema com IA usando o Assistant treinado
   */
  async analyzeData(userId: string, data: any, question: string): Promise<string> {
    try {
      if (!this.openai) {
        throw new BadRequestException('OpenAI não configurada');
      }

      const prompt = `Analise os seguintes dados do sistema e responda a pergunta:

Dados: ${JSON.stringify(data, null, 2)}

Pergunta: ${question}

Forneça uma análise clara e objetiva, com insights práticos para o empresário.`;

      // Usar o mesmo método sendMessage com o assistant
      const response = await this.sendMessage(userId, {
        message: prompt,
      });

      return response.message;
    } catch (error) {
      this.logger.error('❌ Erro ao analisar dados:', error);
      throw new BadRequestException('Erro ao analisar dados');
    }
  }
}

