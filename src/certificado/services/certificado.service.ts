import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from '../entities/certificado.entity';
import { CryptoService } from './crypto.service';

export interface CertificadoInfo {
  id: string;
  nomeRazaoSocial: string;
  cnpj: string;
  validade: string;
  tipo: string;
  status: string;
  dataUpload: string;
  ultimaVerificacao: string;
}

@Injectable()
export class CertificadoService {
  constructor(
    @InjectRepository(Certificado)
    private readonly certificadoRepository: Repository<Certificado>,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(data: any): Promise<Certificado> {
    try {
      const certInfo = await this.validateCertificate(data.arquivo, data.senha);
      
      const certificado = this.certificadoRepository.create({
        nomeRazaoSocial: certInfo.nome,
        cnpj: certInfo.cnpj,
        validade: certInfo.validade,
        tipo: certInfo.tipo,
        arquivoCriptografado: data.arquivo,
        hashArquivo: 'simplified',
        companyId: data.companyId,
        criadoPor: data.criadoPor,
        status: 'ATIVO' as any,
        dataUpload: new Date(),
      });

      return await this.certificadoRepository.save(certificado);
    } catch (error) {
      throw new BadRequestException(`Erro ao criar certificado: ${error.message}`);
    }
  }

  async findByCompany(companyId: string): Promise<Certificado | null> {
    return await this.certificadoRepository.findOne({
      where: { companyId }
    });
  }

  async deleteByCompany(companyId: string): Promise<void> {
    await this.certificadoRepository.delete({ companyId });
  }

  async validateCertificate(arquivo: Buffer, senha: string): Promise<any> {
    try {
      // Simulação de validação do certificado
      // Em produção, aqui você usaria uma biblioteca como 'node-forge' ou 'pkcs12'
      
      if (!arquivo || arquivo.length === 0) {
        throw new Error('Arquivo inválido');
      }

      if (!senha || senha.length < 4) {
        throw new Error('Senha inválida');
      }

      // Simulação de extração de dados do certificado
      return {
        nome: 'Empresa Exemplo LTDA',
        cnpj: '12.345.678/0001-90',
        validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
        tipo: 'A1'
      };
    } catch (error) {
      throw new Error(`Erro na validação do certificado: ${error.message}`);
    }
  }

  mapToResponse(certificado: Certificado): CertificadoInfo {
    return {
      id: certificado.id,
      nomeRazaoSocial: certificado.nomeRazaoSocial,
      cnpj: certificado.cnpj,
      validade: certificado.validade.toISOString(),
      tipo: certificado.tipo,
      status: certificado.status,
      dataUpload: certificado.dataUpload.toISOString(),
      ultimaVerificacao: certificado.ultimaVerificacao?.toISOString() || certificado.dataUpload.toISOString()
    };
  }
}
