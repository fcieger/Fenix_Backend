import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFeIntegrationController } from './nfe-integration.controller';
import { NFeIntegrationService } from './nfe-integration.service';
import { Nfe } from '../nfe/entities/nfe.entity';
import { NfeModule } from '../nfe/nfe.module';
import { ConfiguracaoNfeModule } from '../configuracao-nfe/configuracao-nfe.module';
import { NFeSyncJob } from '../jobs/nfe-sync.job';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Nfe]),
    NfeModule,
    ConfiguracaoNfeModule,
  ],
  controllers: [NFeIntegrationController],
  providers: [NFeIntegrationService, NFeSyncJob],
  exports: [NFeIntegrationService],
})
export class NfeIntegrationModule {}
