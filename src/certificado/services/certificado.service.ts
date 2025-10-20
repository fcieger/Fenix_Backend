import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from '../entities/certificado.entity';
import { CryptoService } from './crypto.service';
import * as crypto from 'crypto';

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

interface TemporaryFile {
  id: string;
  file: Buffer;
  fileName: string;
  fileSize: number;
  companyId: string;
  userId: string;
  createdAt: Date;
}

@Injectable()
export class CertificadoService {
  private temporaryFiles: Map<string, TemporaryFile> = new Map();

  constructor(
    @InjectRepository(Certificado)
    private readonly certificadoRepository: Repository<Certificado>,
    private readonly cryptoService: CryptoService,
  ) {
    // Limpa arquivos temporários a cada 30 minutos
    setInterval(() => {
      this.cleanupTemporaryFiles();
    }, 30 * 60 * 1000);
  }

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

  async saveTemporaryFile(file: any, companyId: string, userId: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    
    const temporaryFile: TemporaryFile = {
      id: sessionId,
      file: file.buffer,
      fileName: file.originalname,
      fileSize: file.size,
      companyId,
      userId,
      createdAt: new Date()
    };

    this.temporaryFiles.set(sessionId, temporaryFile);
    
    console.log(`📁 Arquivo temporário salvo: ${sessionId}`);
    return sessionId;
  }

  async processCertificateWithPassword(sessionId: string, senha: string): Promise<Certificado> {
    const tempFile = this.temporaryFiles.get(sessionId);
    
    if (!tempFile) {
      throw new BadRequestException('Sessão expirada ou inválida. Faça o upload novamente.');
    }

    try {
      // Valida o certificado com a senha
      const certInfo = await this.validateCertificate(tempFile.file, senha);
      
      // Cria o certificado no banco
      const certificado = this.certificadoRepository.create({
        nomeRazaoSocial: certInfo.nome,
        cnpj: certInfo.cnpj,
        validade: certInfo.validade,
        tipo: certInfo.tipo,
        arquivoCriptografado: tempFile.file,
        hashArquivo: 'simplified',
        companyId: tempFile.companyId,
        criadoPor: tempFile.userId,
        status: 'ATIVO' as any,
        dataUpload: new Date(),
      });

      const savedCertificado = await this.certificadoRepository.save(certificado);
      
      // Remove o arquivo temporário
      this.temporaryFiles.delete(sessionId);
      
      console.log(`✅ Certificado processado e salvo: ${savedCertificado.id}`);
      return savedCertificado;
      
    } catch (error) {
      // Remove o arquivo temporário em caso de erro
      this.temporaryFiles.delete(sessionId);
      throw new BadRequestException(`Erro ao processar certificado: ${error.message}`);
    }
  }

  private cleanupTemporaryFiles(): void {
    const now = new Date();
    const maxAge = 30 * 60 * 1000; // 30 minutos

    for (const [sessionId, tempFile] of this.temporaryFiles.entries()) {
      if (now.getTime() - tempFile.createdAt.getTime() > maxAge) {
        this.temporaryFiles.delete(sessionId);
        console.log(`🗑️ Arquivo temporário expirado removido: ${sessionId}`);
      }
    }
  }
}
