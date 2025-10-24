import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosVendaService } from './pedidos-venda.service';
import { PedidosVendaController } from './pedidos-venda.controller';
import { PedidoVenda } from './entities/pedido-venda.entity';
import { PedidoVendaItem } from './entities/pedido-venda-item.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { Cadastro } from '../cadastros/entities/cadastro.entity';
import { NaturezaOperacao } from '../natureza-operacao/entities/natureza-operacao.entity';
import { Company } from '../companies/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PedidoVenda,
      PedidoVendaItem,
      Produto,
      Cadastro,
      NaturezaOperacao,
      Company,
    ]),
  ],
  controllers: [PedidosVendaController],
  providers: [PedidosVendaService],
  exports: [PedidosVendaService],
})
export class PedidosVendaModule {}
