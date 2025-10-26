import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CertificadosService } from './certificados.service';
import { JavaCertificadoService } from './java-certificado.service';
import {
  CreateCertificadoDto,
  UpdateCertificadoDto,
  CertificadoResponseDto,
} from './dto/certificado.dto';

// Validador customizado para certificados
class CertificadoFileValidator {
  static validate(file: any): boolean {
    if (!file) return false;

    // Verificar extensão
    const hasValidExtension = /\.(pfx|p12)$/i.test(file.originalname);

    // Verificar MIME type
    const hasValidMimeType = [
      'application/x-pkcs12',
      'application/pkcs12',
      'application/x-pkcs12-certificate',
      'application/pkcs-12',
    ].includes(file.mimetype);

    return hasValidExtension || hasValidMimeType;
  }
}

@Controller('certificado')
export class CertificadosController {
  constructor(
    private readonly certificadosService: CertificadosService,
    private readonly javaCertificadoService: JavaCertificadoService,
  ) {}

  @Get('test')
  async test() {
    return { message: 'Certificados endpoint working' };
  }

  @Get('test-java')
  async testJava() {
    try {
      const isAvailable =
        await this.javaCertificadoService.testarConectividade();
      return {
        message: 'Teste de conectividade com serviço Java',
        javaServiceAvailable: isAvailable,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Erro ao testar serviço Java',
        javaServiceAvailable: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-service')
  async testService() {
    try {
      // Testar se o serviço está funcionando sem banco de dados
      return {
        message: 'Service working',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return { error: error.message, timestamp: new Date().toISOString() };
    }
  }

  @Get('test-auth')
  async testAuth(@Request() req: any) {
    return {
      message: 'Auth working',
      user: req.user,
      companyId: req.user?.companyId,
      companies: req.user?.companies,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('debug')
  async debug() {
    return {
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test-service-direct/:certId')
  async testServiceDirect(@Param('certId') certId: string) {
    try {
      // Buscar certificado por ID para ver qual companyId foi usado
      const cert = await this.certificadosService.getCertificadoById(certId);
      return {
        message: 'Certificate found',
        cert,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Certificate not found',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-by-company/:companyId')
  async testByCompany(@Param('companyId') companyId: string) {
    try {
      // Buscar certificado por companyId
      const cert = await this.certificadosService.getCertificado(companyId);
      return {
        message: 'Certificate search by companyId',
        cert,
        companyId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Certificate search failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('upload')
  // @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('arquivo'))
  async uploadCertificado(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: any,
    @Body('senha') senha: string,
    @Request() req: any,
  ): Promise<CertificadoResponseDto> {
    if (!senha) {
      throw new BadRequestException('Senha é obrigatória');
    }

    // Validar arquivo de certificado
    if (!CertificadoFileValidator.validate(file)) {
      throw new BadRequestException(
        'Formato de arquivo inválido. Use apenas arquivos .pfx ou .p12',
      );
    }

    // Debug: Log do usuário autenticado
    console.log('🔍 Debug - Usuário autenticado:', {
      hasUser: !!req.user,
      userId: req.user?.id,
      companyId: req.user?.companyId,
      companies: req.user?.companies,
      companiesLength: req.user?.companies?.length,
    });

    // Extrair companyId do usuário autenticado
    const companyId = req.user?.companyId || req.user?.companies?.[0]?.id;

    console.log('🔍 Debug - CompanyId extraído:', companyId);

    if (!companyId) {
      console.error(
        '❌ Debug - CompanyId não encontrado. Estrutura do req.user:',
        JSON.stringify(req.user, null, 2),
      );
      throw new BadRequestException(
        'ID da empresa não encontrado. Faça login novamente.',
      );
    }

    return this.certificadosService.uploadCertificado(
      file,
      senha,
      companyId,
      req.user,
    );
  }

  @Get()
  // @UseGuards(JwtAuthGuard)
  async getCertificado(
    @Request() req: any,
  ): Promise<CertificadoResponseDto | null> {
    try {
      // Debug: Log do usuário autenticado
      console.log('🔍 Debug GET - Usuário autenticado:', {
        hasUser: !!req.user,
        userId: req.user?.id,
        companyId: req.user?.companyId,
        companies: req.user?.companies,
        companiesLength: req.user?.companies?.length,
      });

      // Extrair companyId do usuário autenticado
      const companyId = req.user?.companyId || req.user?.companies?.[0]?.id;

      console.log('🔍 Debug GET - CompanyId extraído:', companyId);

      if (!companyId) {
        console.error(
          '❌ Debug GET - CompanyId não encontrado. Estrutura do req.user:',
          JSON.stringify(req.user, null, 2),
        );
        throw new BadRequestException(
          'ID da empresa não encontrado. Faça login novamente.',
        );
      }

      return this.certificadosService.getCertificado(companyId);
    } catch (error) {
      console.error('❌ Debug GET - Erro no getCertificado:', error);
      throw error;
    }
  }

  @Get('all')
  async getAllCertificados(
    @Request() req: any,
  ): Promise<CertificadoResponseDto[]> {
    // Extrair companyId do usuário autenticado
    const companyId = req.user?.companyId || req.user?.companies?.[0]?.id;

    if (!companyId) {
      throw new BadRequestException(
        'ID da empresa não encontrado. Faça login novamente.',
      );
    }

    return this.certificadosService.getAllCertificados(companyId);
  }

  @Put(':id')
  async updateCertificado(
    @Param('id') id: string,
    @Body() updateData: UpdateCertificadoDto,
    @Request() req: any,
  ): Promise<CertificadoResponseDto> {
    // Extrair companyId do usuário autenticado
    const companyId = req.user?.companyId || req.user?.companies?.[0]?.id;

    if (!companyId) {
      throw new BadRequestException(
        'ID da empresa não encontrado. Faça login novamente.',
      );
    }

    return this.certificadosService.updateCertificado(
      id,
      updateData,
      companyId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCertificado(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    // Extrair companyId do usuário autenticado
    const companyId = req.user?.companyId || req.user?.companies?.[0]?.id;

    if (!companyId) {
      throw new BadRequestException(
        'ID da empresa não encontrado. Faça login novamente.',
      );
    }

    return this.certificadosService.deleteCertificado(id, companyId);
  }

  @Post(':id/verificar')
  async verificarCertificado(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<CertificadoResponseDto> {
    // Extrair companyId do usuário autenticado
    const companyId = req.user?.companyId || req.user?.companies?.[0]?.id;

    if (!companyId) {
      throw new BadRequestException(
        'ID da empresa não encontrado. Faça login novamente.',
      );
    }

    return this.certificadosService.verificarCertificado(id, companyId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCertificadoByCompany(@Request() req: any): Promise<void> {
    // Extrair companyId do usuário autenticado
    const companyId = req.user?.companyId || req.user?.companies?.[0]?.id;

    if (!companyId) {
      throw new BadRequestException(
        'ID da empresa não encontrado. Faça login novamente.',
      );
    }

    const certificado =
      await this.certificadosService.getCertificado(companyId);
    if (certificado) {
      return this.certificadosService.deleteCertificado(
        certificado.id,
        companyId,
      );
    }
  }

  @Post('verificar')
  async verificarCertificadoByCompany(
    @Request() req: any,
  ): Promise<CertificadoResponseDto> {
    // Extrair companyId do usuário autenticado
    const companyId = req.user?.companyId || req.user?.companies?.[0]?.id;

    if (!companyId) {
      throw new BadRequestException(
        'ID da empresa não encontrado. Faça login novamente.',
      );
    }

    const certificado =
      await this.certificadosService.getCertificado(companyId);
    if (!certificado) {
      throw new Error('Certificado não encontrado');
    }

    return this.certificadosService.verificarCertificado(
      certificado.id,
      companyId,
    );
  }
}
