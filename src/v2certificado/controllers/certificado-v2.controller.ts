import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  UseInterceptors, 
  UploadedFile, 
  Body, 
  Request, 
  BadRequestException,
  UseGuards,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CertificadoV2Service } from '../services/certificado-v2.service';
import { UploadCertificadoDto, SubmitPasswordDto } from '../dto/upload-certificado.dto';

@Controller('v2certificado')
@UseGuards(JwtAuthGuard)
export class CertificadoV2Controller {
  constructor(
    private readonly certificadoService: CertificadoV2Service,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('certificado'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body() uploadDto: UploadCertificadoDto,
    @Request() req: any
  ) {
    try {
      console.log('📤 V2 Upload recebido:', {
        fileName: file?.originalname,
        fileSize: file?.size,
        companyId: uploadDto.companyId
      });

      return await this.certificadoService.uploadFile(
        file, 
        uploadDto.companyId, 
        req.user.id, 
        uploadDto.observacoes
      );
    } catch (error) {
      console.error('❌ Erro no upload V2:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Post('submit-password')
  async submitPassword(
    @Body() passwordDto: SubmitPasswordDto,
    @Request() req: any
  ) {
    try {
      console.log('🔐 V2 Senha recebida:', {
        sessionId: passwordDto.sessionId,
        hasPassword: !!passwordDto.senha
      });

      return await this.certificadoService.submitPassword(
        passwordDto.sessionId, 
        passwordDto.senha
      );
    } catch (error) {
      console.error('❌ Erro ao processar senha V2:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Get('meus-certificados')
  async getMeusCertificados(@Request() req: any) {
    try {
      const companyId = req.user.companyId;
      const certificados = await this.certificadoService.findByCompany(companyId);
      return {
        success: true,
        certificados: certificados.map(cert => this.certificadoService['mapToResponse'](cert))
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async deleteCertificado(@Request() req: any, @Param('id') id: string) {
    try {
      return await this.certificadoService.deleteById(id, req.user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
