import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CertificadoV2, CertificadoStatus, CertificadoTipo } from '../entities/certificado-v2.entity';
import * as crypto from 'crypto';

interface TemporaryUpload {
  id: string;
  file: Buffer;
  fileName: string;
  fileSize: number;
  companyId: string;
  userId: string;
  createdAt: Date;
  observacoes?: string;
}

@Injectable()
export class CertificadoV2Service {
  private temporaryUploads: Map<string, TemporaryUpload> = new Map();

  constructor(
    @InjectRepository(CertificadoV2)
    private readonly certificadoRepository: Repository<CertificadoV2>,
  ) {
    // Limpeza automática a cada 15 minutos
    setInterval(() => this.cleanupTemporaryUploads(), 15 * 60 * 1000);
  }

  async uploadFile(file: any, companyId: string, userId: string, observacoes?: string): Promise<any> {
    // Validações do arquivo
    this.validateFile(file);

    const sessionId = crypto.randomUUID();
    
    const tempUpload: TemporaryUpload = {
      id: sessionId,
      file: file.buffer,
      fileName: file.originalname,
      fileSize: file.size,
      companyId,
      userId,
      createdAt: new Date(),
      observacoes
    };

    this.temporaryUploads.set(sessionId, tempUpload);

    return {
      success: true,
      sessionId,
      message: 'Arquivo carregado com sucesso! Agora informe a senha do certificado.',
      fileInfo: {
        nome: file.originalname,
        tamanho: this.formatFileSize(file.size),
        tipo: this.getFileType(file.originalname)
      }
    };
  }

  async submitPassword(sessionId: string, senha: string): Promise<any> {
    const tempUpload = this.temporaryUploads.get(sessionId);
    
    if (!tempUpload) {
      throw new BadRequestException('Sessão expirada. Faça o upload novamente.');
    }

    try {
      // Valida o certificado com a senha
      const certInfo = await this.validateCertificate(tempUpload.file, senha);
      
      // Cria o certificado no banco
      const certificado = this.certificadoRepository.create({
        nomeRazaoSocial: certInfo.nome,
        cnpj: certInfo.cnpj,
        validade: certInfo.validade,
        tipo: CertificadoTipo.A1, // Apenas A1 por enquanto
        arquivoOriginal: tempUpload.file,
        arquivoCriptografado: await this.encryptFile(tempUpload.file),
        hashArquivo: this.generateFileHash(tempUpload.file),
        nomeArquivo: tempUpload.fileName,
        tamanhoArquivo: tempUpload.fileSize,
        companyId: tempUpload.companyId,
        criadoPor: tempUpload.userId,
        observacoes: tempUpload.observacoes,
        status: CertificadoStatus.ATIVO,
        dataUpload: new Date(),
      });

      const savedCertificado = await this.certificadoRepository.save(certificado);
      
      // Remove upload temporário
      this.temporaryUploads.delete(sessionId);
      
      return {
        success: true,
        message: 'Certificado A1 processado e salvo com sucesso!',
        certificado: this.mapToResponse(savedCertificado)
      };
      
    } catch (error) {
      this.temporaryUploads.delete(sessionId);
      throw new BadRequestException(`Erro ao processar certificado: ${error.message}`);
    }
  }

  async findByCompany(companyId: string): Promise<CertificadoV2[]> {
    return await this.certificadoRepository.find({
      where: { companyId },
      order: { dataUpload: 'DESC' }
    });
  }

  async deleteById(id: string, userId: string): Promise<any> {
    const certificado = await this.certificadoRepository.findOne({
      where: { id, criadoPor: userId }
    });

    if (!certificado) {
      throw new NotFoundException('Certificado não encontrado');
    }

    await this.certificadoRepository.remove(certificado);

    return {
      success: true,
      message: 'Certificado removido com sucesso'
    };
  }

  private validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    if (!file.originalname.endsWith('.pfx') && !file.originalname.endsWith('.p12')) {
      throw new BadRequestException('Formato inválido. Use apenas arquivos .pfx ou .p12');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new BadRequestException('Arquivo muito grande. Máximo 10MB');
    }

    if (file.size < 1024) { // 1KB
      throw new BadRequestException('Arquivo muito pequeno. Verifique se é um certificado válido');
    }
  }

  private async validateCertificate(arquivo: Buffer, senha: string): Promise<any> {
    // Implementação de validação do certificado
    // Em produção, use bibliotecas como 'node-forge' ou 'pkcs12'
    
    if (!senha || senha.length < 4) {
      throw new Error('Senha inválida');
    }

    // Simulação de validação - em produção implementar validação real
    return {
      nome: 'Empresa Exemplo LTDA',
      cnpj: '12.345.678/0001-90',
      validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      tipo: 'A1'
    };
  }

  private async encryptFile(file: Buffer): Promise<Buffer> {
    // Implementação de criptografia
    return file; // Simplificado por enquanto
  }

  private generateFileHash(file: Buffer): string {
    return crypto.createHash('sha256').update(file).digest('hex');
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private getFileType(fileName: string): string {
    return fileName.endsWith('.pfx') ? 'PFX' : 'P12';
  }

  private mapToResponse(certificado: CertificadoV2): any {
    return {
      id: certificado.id,
      nomeRazaoSocial: certificado.nomeRazaoSocial,
      cnpj: certificado.cnpj,
      validade: certificado.validade.toISOString(),
      tipo: certificado.tipo,
      status: certificado.status,
      nomeArquivo: certificado.nomeArquivo,
      tamanhoArquivo: this.formatFileSize(certificado.tamanhoArquivo),
      dataUpload: certificado.dataUpload.toISOString(),
      observacoes: certificado.observacoes
    };
  }

  private cleanupTemporaryUploads(): void {
    const now = new Date();
    const maxAge = 15 * 60 * 1000; // 15 minutos

    for (const [sessionId, upload] of this.temporaryUploads.entries()) {
      if (now.getTime() - upload.createdAt.getTime() > maxAge) {
        this.temporaryUploads.delete(sessionId);
        console.log(`🗑️ Upload temporário expirado removido: ${sessionId}`);
      }
    }
  }
}
