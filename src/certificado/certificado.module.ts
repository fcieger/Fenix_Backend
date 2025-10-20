import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificadoController } from './controllers/certificado.controller';
import { CertificadoService } from './services/certificado.service';
import { CryptoService } from './services/crypto.service';
import { Certificado } from './entities/certificado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificado])],
  controllers: [CertificadoController],
  providers: [CertificadoService, CryptoService],
  exports: [CertificadoService],
})
export class CertificadoModule {}
