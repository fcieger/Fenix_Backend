import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContasFinanceirasService } from './contas-financeiras.service';
import { ContasFinanceirasController } from './contas-financeiras.controller';
import { ContaFinanceira } from './entities/conta-financeira.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContaFinanceira])],
  controllers: [ContasFinanceirasController],
  providers: [ContasFinanceirasService],
  exports: [ContasFinanceirasService],
})
export class ContasFinanceirasModule {}

