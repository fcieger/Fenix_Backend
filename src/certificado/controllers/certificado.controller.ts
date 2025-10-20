import { Controller, Post, Get, Delete, UseInterceptors, UploadedFile, Body, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CertificadoService } from '../services/certificado.service';
import { CryptoService } from '../services/crypto.service';

@Controller('certificado')
export class CertificadoController {
  constructor(
    private readonly certificadoService: CertificadoService,
    private readonly cryptoService: CryptoService,
  ) {}

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('certificado'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body('companyId') companyId: string,
    @Request() req: any
  ) {
    try {
      console.log('📤 Upload de arquivo recebido:', {
        hasFile: !!file,
        hasCompanyId: !!companyId,
        companyId: companyId,
        fileName: file?.originalname
      });

      if (!file) {
        throw new BadRequestException('Arquivo é obrigatório');
      }

      if (!companyId) {
        throw new BadRequestException('ID da empresa é obrigatório');
      }

      if (!file.originalname.endsWith('.pfx') && !file.originalname.endsWith('.p12')) {
        throw new BadRequestException('Formato inválido. Use apenas arquivos .pfx ou .p12');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new BadRequestException('Arquivo muito grande. Máximo 5MB');
      }

      // Salva o arquivo temporariamente e retorna um ID de sessão
      const sessionId = await this.certificadoService.saveTemporaryFile(file, companyId, req.user.id);

      return {
        success: true,
        message: 'Arquivo carregado com sucesso. Agora informe a senha.',
        sessionId: sessionId,
        fileName: file.originalname,
        fileSize: file.size
      };
    } catch (error) {
      console.error('❌ Erro no upload do arquivo:', error);
      throw new BadRequestException({
        message: error.message || 'Erro interno do servidor',
        error: error.name || 'InternalServerError',
        statusCode: 400
      });
    }
  }

  @Post('submit-password')
  async submitPassword(
    @Body('sessionId') sessionId: string,
    @Body('senha') senha: string,
    @Request() req: any
  ) {
    try {
      console.log('🔐 Senha recebida para sessão:', {
        sessionId: sessionId,
        hasSenha: !!senha
      });

      if (!sessionId) {
        throw new BadRequestException('ID da sessão é obrigatório');
      }

      if (!senha) {
        throw new BadRequestException('Senha é obrigatória');
      }

      if (senha.length < 4) {
        throw new BadRequestException('Senha deve ter pelo menos 4 caracteres');
      }

      // Processa o certificado com a senha fornecida
      const certificado = await this.certificadoService.processCertificateWithPassword(sessionId, senha);

      return {
        success: true,
        message: 'Certificado processado com sucesso!',
        certificado: this.certificadoService.mapToResponse(certificado)
      };
    } catch (error) {
      console.error('❌ Erro ao processar senha:', error);
      throw new BadRequestException({
        message: error.message || 'Erro interno do servidor',
        error: error.name || 'InternalServerError',
        statusCode: 400
      });
    }
  }

  @Get()
  async getCertificado(@Request() req: any) {
    try {
      const companyId = req.user.companyId;
      const certificado = await this.certificadoService.findByCompany(companyId);
      
      if (!certificado) {
        return null;
      }

      return this.certificadoService.mapToResponse(certificado);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete()
  async deleteCertificado(@Request() req: any) {
    try {
      const companyId = req.user.companyId;
      await this.certificadoService.deleteByCompany(companyId);
      
      return {
        success: true
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('verificar')
  async verificarCertificado(@Request() req: any) {
    try {
      const companyId = req.user.companyId;
      const certificado = await this.certificadoService.findByCompany(companyId);
      
      if (!certificado) {
        throw new BadRequestException('Nenhum certificado encontrado');
      }

      return this.certificadoService.mapToResponse(certificado);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
