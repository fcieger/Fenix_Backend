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

  @Post('validate-password')
  async validatePassword(@Body('senha') senha: string) {
    try {
      if (!senha) {
        throw new BadRequestException('Senha é obrigatória');
      }
      
      if (senha.length < 4) {
        throw new BadRequestException('Senha deve ter pelo menos 4 caracteres');
      }

      return {
        success: true,
        message: 'Senha válida'
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('certificado'))
  async uploadCertificado(
    @UploadedFile() file: any,
    @Body('senha') senha: string,
    @Body('companyId') companyId: string,
    @Request() req: any
  ) {
    try {
      console.log('📤 Upload recebido:', {
        hasFile: !!file,
        hasSenha: !!senha,
        hasCompanyId: !!companyId,
        companyId: companyId,
        fileName: file?.originalname
      });

      if (!file) {
        throw new BadRequestException('Arquivo é obrigatório');
      }

      if (!senha) {
        throw new BadRequestException('Senha é obrigatória');
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

      const uploadData = {
        arquivo: file.buffer,
        senha: senha,
        companyId,
        criadoPor: req.user.id
      };

      const certificado = await this.certificadoService.create(uploadData);

      return {
        success: true,
        certificado: this.certificadoService.mapToResponse(certificado)
      };
    } catch (error) {
      console.error('❌ Erro no upload do certificado:', error);
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
