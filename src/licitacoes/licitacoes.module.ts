import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { LicitacoesController } from './licitacoes.controller';
import { LicitacoesService } from './licitacoes.service';
import { Licitacao } from './entities/licitacao.entity';
import { AlertaLicitacao } from './entities/alerta-licitacao.entity';
import { PncpService } from './integrations/pncp.service';
import { ComprasGovService } from './integrations/compras-gov.service';
import { AggregatorService } from './integrations/aggregator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Licitacao, AlertaLicitacao]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [LicitacoesController],
  providers: [
    LicitacoesService,
    PncpService,
    ComprasGovService,
    AggregatorService,
  ],
  exports: [LicitacoesService],
})
export class LicitacoesModule {}



