import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { CreditoController } from './credito.controller';
import { CreditoService } from './credito.service';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { SolicitacaoCredito } from './entities/solicitacao-credito.entity';
import { DocumentoCredito } from './entities/documento-credito.entity';
import { AnaliseCredito } from './entities/analise-credito.entity';
import { PropostaCredito } from './entities/proposta-credito.entity';
import { CapitalGiro } from './entities/capital-giro.entity';
import { MovimentacaoCapitalGiro } from './entities/movimentacao-capital-giro.entity';
import { AntecipacaoRecebiveis } from './entities/antecipacao-recebiveis.entity';
import { VisualizacaoProposta } from './entities/visualizacao-proposta.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolicitacaoCredito,
      DocumentoCredito,
      AnaliseCredito,
      PropostaCredito,
      CapitalGiro,
      MovimentacaoCapitalGiro,
      AntecipacaoRecebiveis,
      VisualizacaoProposta,
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
    NotificationsModule,
  ],
  controllers: [CreditoController, DocumentosController],
  providers: [CreditoService, DocumentosService],
  exports: [CreditoService, DocumentosService],
})
export class CreditoModule {}

