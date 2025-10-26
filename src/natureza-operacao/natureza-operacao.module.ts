import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NaturezaOperacaoService } from './natureza-operacao.service';
import { NaturezaOperacaoController } from './natureza-operacao.controller';
import { NaturezaOperacao } from './entities/natureza-operacao.entity';
import { ConfiguracaoImpostoEstado } from './entities/configuracao-imposto-estado.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NaturezaOperacao, ConfiguracaoImpostoEstado]),
  ],
  controllers: [NaturezaOperacaoController],
  providers: [NaturezaOperacaoService],
  exports: [NaturezaOperacaoService],
})
export class NaturezaOperacaoModule {}
