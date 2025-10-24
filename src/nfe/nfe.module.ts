import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NfeService } from './nfe.service';
import { NfeController } from './nfe.controller';
import { Nfe } from './entities/nfe.entity';
import { NfeItem } from './entities/nfe-item.entity';
import { NfeDuplicata } from './entities/nfe-duplicata.entity';
import { ConfiguracaoNfeModule } from '../configuracao-nfe/configuracao-nfe.module';
import { NaturezaOperacaoModule } from '../natureza-operacao/natureza-operacao.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Nfe, NfeItem, NfeDuplicata]),
    ConfiguracaoNfeModule,
    NaturezaOperacaoModule,
  ],
  controllers: [NfeController],
  providers: [NfeService],
  exports: [NfeService],
})
export class NfeModule {}

