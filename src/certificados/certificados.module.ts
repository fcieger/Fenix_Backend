import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CertificadosController } from './certificados.controller';
import { CertificadosService } from './certificados.service';
import { JavaCertificadoService } from './java-certificado.service';
import { Certificado } from './entities/certificado.entity';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificado]),
    ConfigModule,
    CompaniesModule,
  ],
  controllers: [CertificadosController],
  providers: [CertificadosService, JavaCertificadoService],
  exports: [CertificadosService],
})
export class CertificadosModule {}
