import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosService } from './orcamentos.service';
import { Orcamento } from './entities/orcamento.entity';
import { OrcamentoItem } from './entities/orcamento-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Orcamento, OrcamentoItem])],
  controllers: [OrcamentosController],
  providers: [OrcamentosService],
  exports: [TypeOrmModule, OrcamentosService],
})
export class OrcamentosModule {}


