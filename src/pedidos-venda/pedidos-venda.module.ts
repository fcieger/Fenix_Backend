import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosVendaController } from './pedidos-venda.controller';
import { PedidosVendaService } from './pedidos-venda.service';
import { PedidoVenda } from './entities/pedido-venda.entity';
import { PedidoVendaItem } from './entities/pedido-venda-item.entity';
import { OrcamentosModule } from '../orcamentos/orcamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PedidoVenda, PedidoVendaItem]),
    OrcamentosModule,
  ],
  controllers: [PedidosVendaController],
  providers: [PedidosVendaService],
  exports: [PedidosVendaService],
})
export class PedidosVendaModule {}
