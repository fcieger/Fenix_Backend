import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificado } from './entities/certificado.entity';
import { CreateCertificadoDto, UpdateCertificadoDto, CertificadoResponseDto } from './dto/certificado.dto';
import { JavaCertificadoService } from './java-certificado.service';
import { CompaniesService } from '../companies/companies.service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';

@Injectable()
export class CertificadosService {
  private readonly logger = new Logger(CertificadosService.name);
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'certificados');
  private readonly encryptionKey = process.env.CERTIFICATE_ENCRYPTION_KEY || 'fenix-cert-key-2024';

  constructor(
    @InjectRepository(Certificado)
    private certificadoRepository: Repository<Certificado>,
    private javaCertificadoService: JavaCertificadoService,
    private companiesService: CompaniesService,
  ) {
    // Criar diretório de uploads se não existir
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  private encryptPassword(password: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), Buffer.alloc(16));
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptPassword(encryptedPassword: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32, '0').slice(0, 32)), Buffer.alloc(16));
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  private generateFileHash(file: any): string {
    return crypto.createHash('sha256').update(file.buffer).digest('hex');
  }

  private async validateCertificateCompany(certificadoCnpj: string, companyId: string): Promise<void> {
    try {
      // Buscar dados da empresa
      const company = await this.companiesService.findById(companyId);
      
      if (!company) {
        throw new BadRequestException('Empresa não encontrada');
      }

      // Normalizar CNPJs (remover formatação)
      const normalizeCnpj = (cnpj: string) => cnpj.replace(/[^\d]/g, '');
      
      const certificadoCnpjNormalized = normalizeCnpj(certificadoCnpj);
      const companyCnpjNormalized = normalizeCnpj(company.cnpj);

      this.logger.log(`Validando CNPJ do certificado: ${certificadoCnpjNormalized} com empresa: ${companyCnpjNormalized}`);

      // Verificar se os CNPJs são iguais
      if (certificadoCnpjNormalized !== companyCnpjNormalized) {
        throw new BadRequestException(
          `O certificado digital não é válido para esta empresa. ` +
          `O CNPJ do certificado (${certificadoCnpj}) deve ser o mesmo da empresa cadastrada (${company.cnpj}). ` +
          `Por favor, faça upload de um certificado digital da empresa ${company.name}.`
        );
      }

      this.logger.log('✅ Validação de CNPJ aprovada - certificado pertence à empresa');
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erro na validação de CNPJ: ${error.message}`);
      throw new BadRequestException('Erro ao validar certificado: ' + error.message);
    }
  }

  private async saveFile(file: any, companyId: string): Promise<string> {
    const fileName = `${companyId}-${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadPath, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    return filePath;
  }

  private async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private toResponseDto(certificado: Certificado): CertificadoResponseDto {
    // Helper function to safely convert date to string
    const dateToString = (date: Date | string): string => {
      if (typeof date === 'string') {
        // Se já é string, verifica se precisa formatar
        return date.split('T')[0];
      }
      return date.toISOString().split('T')[0];
    };

    return {
      id: certificado.id,
      nome: certificado.nome,
      cnpj: certificado.cnpj,
      validade: dateToString(certificado.validade),
      tipo: certificado.tipo,
      status: certificado.status,
      nomeArquivo: certificado.nomeArquivo,
      dataUpload: dateToString(certificado.createdAt),
      ultimaVerificacao: dateToString(certificado.ultimaVerificacao),
      diasRestantes: certificado.getDaysUntilExpiration(),
      observacoes: certificado.observacoes,
    };
  }

  async uploadCertificado(
    file: any,
    senha: string,
    companyId: string,
    userInfo: any
  ): Promise<CertificadoResponseDto> {
    try {
      // Validar arquivo
      if (!file) {
        throw new BadRequestException('Arquivo não fornecido');
      }

      if (!file.originalname.endsWith('.pfx') && !file.originalname.endsWith('.p12')) {
        throw new BadRequestException('Formato de arquivo inválido. Use apenas .pfx ou .p12');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        throw new BadRequestException('Arquivo muito grande. Máximo 10MB');
      }

      if (file.size < 1024) { // 1KB
        throw new BadRequestException('Arquivo muito pequeno. Verifique se é um certificado válido');
      }

      // Verificar se já existe certificado para esta empresa
      const existingCert = await this.certificadoRepository.findOne({
        where: { companyId }
      });

      if (existingCert) {
        // Deletar arquivo antigo
        await this.deleteFile(existingCert.caminhoArquivo);
        await this.certificadoRepository.remove(existingCert);
      }

      // Gerar hash do arquivo
      const hashArquivo = this.generateFileHash(file);

      // Salvar arquivo
      const caminhoArquivo = await this.saveFile(file, companyId);

      // Criptografar senha
      const senhaCriptografada = this.encryptPassword(senha);

      // Extrair dados reais do certificado
      const certificadoData = await this.extractCertificadoData(file, senha);

      // Validar se o CNPJ do certificado corresponde ao CNPJ da empresa
      await this.validateCertificateCompany(certificadoData.cnpj, companyId);

      // Criar certificado
      const certificado = this.certificadoRepository.create({
        nome: certificadoData.nome,
        cnpj: certificadoData.cnpj,
        validade: new Date(certificadoData.validade),
        tipo: certificadoData.tipo,
        status: 'ativo',
        nomeArquivo: file.originalname,
        caminhoArquivo,
        hashArquivo,
        senhaCriptografada,
        companyId,
        ultimaVerificacao: new Date(),
      });

      const savedCertificado = await this.certificadoRepository.save(certificado);
      return this.toResponseDto(savedCertificado);

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao processar certificado: ' + error.message);
    }
  }

  private async extractCertificadoData(file: any, senha: string): Promise<any> {
    try {
      this.logger.log('Tentando extrair dados do certificado usando serviço Java...');
      
      // Primeiro, tentar usar o serviço Java
      const isJavaServiceAvailable = await this.javaCertificadoService.testarConectividade();
      
      if (isJavaServiceAvailable) {
        this.logger.log('Serviço Java disponível, usando validação real...');
        
        try {
          const javaResult = await this.javaCertificadoService.validarCertificado(
            file.buffer,
            file.originalname,
            senha
          );
          
          this.logger.log(`Certificado validado com sucesso via Java: ${javaResult.nome}`);
          
          return {
            nome: javaResult.nome,
            cnpj: javaResult.cnpj,
            validade: javaResult.validade,
            tipo: javaResult.tipo
          };
        } catch (javaError) {
          this.logger.warn(`Erro no serviço Java, usando fallback: ${javaError.message}`);
        }
      } else {
        this.logger.warn('Serviço Java não disponível, usando validação local...');
      }
      
      // Fallback para validação local com node-forge
      return await this.extractCertificadoDataLocal(file, senha);
      
    } catch (error) {
      this.logger.error(`Erro ao extrair dados do certificado: ${error.message}`);
      
      // Último fallback para dados simulados
      this.logger.warn('Usando dados simulados como último recurso');
      return this.simulateCertificadoDataFallback(file.originalname);
    }
  }

  private async extractCertificadoDataLocal(file: any, senha: string): Promise<any> {
    try {
      // Converter buffer para string base64
      const p12Der = forge.util.decode64(file.buffer.toString('base64'));
      
      // Ler o arquivo PKCS#12
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, senha);
      
      // Buscar o certificado
      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = bags[forge.pki.oids.certBag];
      
      if (!certBag || certBag.length === 0) {
        throw new Error('Nenhum certificado encontrado no arquivo');
      }
      
      const cert = certBag[0].cert;
      
      if (!cert) {
        throw new Error('Certificado inválido');
      }
      
      // Extrair informações do certificado
      const subject = cert.subject;
      const issuer = cert.issuer;
      const validNotAfter = cert.validity.notAfter;
      const validNotBefore = cert.validity.notBefore;
      
      // Extrair CNPJ do subject
      const cnpj = this.extractCNPJFromSubject(subject);
      
      // Extrair nome da empresa do subject
      const nome = this.extractCompanyNameFromSubject(subject);
      
      // Determinar tipo do certificado baseado no nome do arquivo
      const isA3 = file.originalname.toLowerCase().includes('a3') || 
                   file.originalname.toLowerCase().includes('token');
      
      const result = {
        nome: nome || 'EMPRESA NÃO IDENTIFICADA',
        cnpj: cnpj || '00.000.000/0000-00',
        validade: validNotAfter.toISOString().split('T')[0],
        tipo: isA3 ? 'A3' : 'A1'
      };
      
      return result;
      
    } catch (error) {
      this.logger.error(`Erro na validação local: ${error.message}`);
      throw error;
    }
  }

  private extractCNPJFromSubject(subject: any): string | null {
    try {
      // Procurar por CNPJ no subject
      for (const attribute of subject.attributes) {
        if (attribute.type === forge.pki.oids.commonName) {
          const value = attribute.value;
          
          // Procurar por padrão de CNPJ na string (formato: 12.345.678-0001-90)
          const cnpjMatch = value.match(/(\d{2}\.\d{3}\.\d{3}-\d{4}-\d{2})/);
          if (cnpjMatch) {
            let cnpj = cnpjMatch[1];
            // Converter para formato padrão de CNPJ
            cnpj = cnpj.replace(/(\d{2})\.(\d{3})\.(\d{3})-(\d{4})-(\d{2})/, '$1.$2.$3/$4-$5');
            return cnpj;
          }
          
          // Tentar outros formatos de CNPJ
          const cnpjMatch2 = value.match(/(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})/);
          if (cnpjMatch2) {
            let cnpj = cnpjMatch2[1];
            // Formatar CNPJ se necessário
            cnpj = cnpj.replace(/\D/g, ''); // Remove tudo que não é dígito
            if (cnpj.length === 14) {
              return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao extrair CNPJ:', error);
      return null;
    }
  }

  private extractCompanyNameFromSubject(subject: any): string | null {
    try {
      // Procurar por nome da empresa no subject
      for (const attribute of subject.attributes) {
        if (attribute.type === forge.pki.oids.commonName) {
          const value = attribute.value;
          
          // Remover CNPJ e dois pontos se presente
          let nome = value.replace(/:\s*\d{2}\.\d{3}\.\d{3}-\d{4}-\d{2}/, '').trim();
          
          // Se ainda tiver CNPJ em outro formato, remover também
          nome = nome.replace(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/, '').trim();
          
          // Se ficou vazio, usar o valor original
          if (!nome) {
            nome = value;
          }
          
          return nome;
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao extrair nome da empresa:', error);
      return null;
    }
  }

  private simulateCertificadoDataFallback(fileName: string): any {
    // Fallback para dados simulados se a extração real falhar
    const now = new Date();
    const validade = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 ano

    const companies = [
      'EMPRESA EXEMPLO LTDA',
      'TECH SOLUTIONS S.A.',
      'INOVAÇÃO DIGITAL LTDA',
      'SISTEMAS INTEGRADOS S.A.',
      'NEGÓCIOS MODERNOS LTDA',
      'TECNOLOGIA AVANÇADA S.A.',
      'SOLUÇÕES INTELIGENTES LTDA',
      'DIGITAL BUSINESS S.A.'
    ];

    // Gerar dados baseados no nome do arquivo
    let hash = 0;
    for (let i = 0; i < fileName.length; i++) {
      const char = fileName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const companyIndex = Math.abs(hash) % companies.length;
    const isA3 = fileName.toLowerCase().includes('a3') || fileName.toLowerCase().includes('token');
    
    return {
      nome: companies[companyIndex],
      cnpj: this.generateCNPJ(),
      validade: validade.toISOString().split('T')[0],
      tipo: isA3 ? 'A3' : 'A1'
    };
  }

  private generateCNPJ(): string {
    const cnpj = Math.floor(Math.random() * 90000000000000) + 10000000000000;
    return cnpj.toString().replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  async getCertificadoById(id: string): Promise<any | null> {
    try {
      const certificado = await this.certificadoRepository.findOne({
        where: { id }
      });

      if (!certificado) {
        return null;
      }

      return certificado;
    } catch (error) {
      console.error('❌ Debug Service - Erro no getCertificadoById:', error);
      throw error;
    }
  }

  async getCertificado(companyId: string): Promise<CertificadoResponseDto | null> {
    try {
      console.log('🔍 Debug Service - Buscando certificado para companyId:', companyId);
      
      const certificado = await this.certificadoRepository.findOne({
        where: { companyId }
      });
      console.log('🔍 Debug Service - Certificado encontrado:', !!certificado);

      if (!certificado) {
        console.log('🔍 Debug Service - Nenhum certificado encontrado para companyId:', companyId);
        return null;
      }

      console.log('🔍 Debug Service - Atualizando status do certificado');
      // Atualizar status baseado na validade
      certificado.updateStatus();
      await this.certificadoRepository.save(certificado);

      console.log('🔍 Debug Service - Mapeando para DTO');
      const result = this.toResponseDto(certificado);
      console.log('🔍 Debug Service - DTO mapeado:', !!result);

      return result;
    } catch (error) {
      console.error('❌ Debug Service - Erro no getCertificado:', error);
      throw error;
    }
  }

  async getAllCertificados(companyId: string): Promise<CertificadoResponseDto[]> {
    const certificados = await this.certificadoRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' }
    });

    // Atualizar status de todos os certificados
    for (const cert of certificados) {
      cert.updateStatus();
    }
    await this.certificadoRepository.save(certificados);

    return certificados.map(cert => this.toResponseDto(cert));
  }

  async updateCertificado(
    id: string,
    updateData: UpdateCertificadoDto,
    companyId: string
  ): Promise<CertificadoResponseDto> {
    const certificado = await this.certificadoRepository.findOne({
      where: { id, companyId }
    });

    if (!certificado) {
      throw new NotFoundException('Certificado não encontrado');
    }

    // Atualizar campos
    Object.assign(certificado, updateData);

    if (updateData.validade) {
      certificado.validade = new Date(updateData.validade);
    }

    // Atualizar status
    certificado.updateStatus();
    certificado.ultimaVerificacao = new Date();

    const updatedCertificado = await this.certificadoRepository.save(certificado);
    return this.toResponseDto(updatedCertificado);
  }

  async deleteCertificado(id: string, companyId: string): Promise<void> {
    const certificado = await this.certificadoRepository.findOne({
      where: { id, companyId }
    });

    if (!certificado) {
      throw new NotFoundException('Certificado não encontrado');
    }

    // Deletar arquivo
    await this.deleteFile(certificado.caminhoArquivo);

    // Deletar registro
    await this.certificadoRepository.remove(certificado);
  }

  async verificarCertificado(id: string, companyId: string): Promise<CertificadoResponseDto> {
    const certificado = await this.certificadoRepository.findOne({
      where: { id, companyId }
    });

    if (!certificado) {
      throw new NotFoundException('Certificado não encontrado');
    }

    // Atualizar verificação
    certificado.ultimaVerificacao = new Date();
    certificado.updateStatus();

    const updatedCertificado = await this.certificadoRepository.save(certificado);
    return this.toResponseDto(updatedCertificado);
  }

  async getCertificadoByCompany(companyId: string): Promise<CertificadoResponseDto | null> {
    return this.getCertificado(companyId);
  }
}
