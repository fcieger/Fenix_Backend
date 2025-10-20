import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadoV2Controller } from './controllers/certificado-v2.controller';
import { CertificadoV2Service } from './services/certificado-v2.service';
import { CertificadoV2 } from './entities/certificado-v2.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CertificadoV2])],
  controllers: [CertificadoV2Controller],
  providers: [CertificadoV2Service],
  exports: [CertificadoV2Service],
})
export class V2CertificadoModule {}
