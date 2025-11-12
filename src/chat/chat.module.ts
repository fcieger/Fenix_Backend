import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatToolsService } from './chat-tools.service';
import { ChatMessage } from './entities/chat-message.entity';
import { PedidoVenda } from '../pedidos-venda/entities/pedido-venda.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { Cadastro } from '../cadastros/entities/cadastro.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatMessage, 
      PedidoVenda, 
      Produto, 
      Cadastro,
    ]),
    ConfigModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatToolsService],
  exports: [ChatService],
})
export class ChatModule {}

