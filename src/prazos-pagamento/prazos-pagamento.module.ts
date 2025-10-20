import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrazoPagamentoService } from './services/prazo-pagamento.service';
import { PrazoPagamentoController } from './controllers/prazo-pagamento.controller';
import { PrazoPagamento } from './entities/prazo-pagamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrazoPagamento])],
  controllers: [PrazoPagamentoController],
  providers: [PrazoPagamentoService],
  exports: [PrazoPagamentoService],
})
export class PrazosPagamentoModule {}
