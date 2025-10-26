import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImpostosController } from './impostos.controller';
import { CalculadoraImpostosService } from './impostos.service';
import { NaturezaOperacao } from '../natureza-operacao/entities/natureza-operacao.entity';
import { ConfiguracaoImpostoEstado } from '../natureza-operacao/entities/configuracao-imposto-estado.entity';
import { Company } from '../companies/entities/company.entity';
import { Cadastro } from '../cadastros/entities/cadastro.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NaturezaOperacao,
      ConfiguracaoImpostoEstado,
      Company,
      Cadastro,
    ]),
  ],
  controllers: [ImpostosController],
  providers: [CalculadoraImpostosService],
  exports: [CalculadoraImpostosService],
})
export class ImpostosModule {}
