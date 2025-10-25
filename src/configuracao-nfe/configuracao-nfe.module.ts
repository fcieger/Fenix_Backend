import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracaoNfe } from './entities/configuracao-nfe.entity';
import { ConfiguracaoNfeService } from './configuracao-nfe.service';
import { ConfiguracaoNfeCryptoService } from './configuracao-nfe-crypto.service';
import { ConfiguracaoNfeController } from './configuracao-nfe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracaoNfe])],
  controllers: [ConfiguracaoNfeController],
  providers: [ConfiguracaoNfeService, ConfiguracaoNfeCryptoService],
  exports: [ConfiguracaoNfeService],
})
export class ConfiguracaoNfeModule {}



















