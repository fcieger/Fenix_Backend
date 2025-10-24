import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ConfiguracaoNfeService } from './configuracao-nfe.service';
import { CreateConfiguracaoNfeDto } from './dto/create-configuracao-nfe.dto';
import { UpdateConfiguracaoNfeDto } from './dto/update-configuracao-nfe.dto';
import { ConfiguracaoNfeResponseDto } from './dto/configuracao-nfe-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('configuracao-nfe')
@UseGuards(JwtAuthGuard)
export class ConfiguracaoNfeController {
  constructor(private readonly configuracaoNfeService: ConfiguracaoNfeService) {}

  /**
   * Criar nova configuração de NFe
   * POST /api/configuracao-nfe
   */
  @Post()
  async create(
    @Request() req,
    @Body() createDto: CreateConfiguracaoNfeDto,
  ): Promise<ConfiguracaoNfeResponseDto> {
    const companyId = req.user.companyId;
    console.log('🔧 Debug Controller - CompanyId recebido:', companyId);
    return this.configuracaoNfeService.create(companyId, createDto);
  }

  /**
   * Listar todas as configurações da empresa
   * GET /api/configuracao-nfe?apenasAtivas=true
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('apenasAtivas') apenasAtivas?: string,
  ): Promise<ConfiguracaoNfeResponseDto[]> {
    const companyId = req.user.activeCompanyId;
    const filtrarAtivas = apenasAtivas === 'true';
    return this.configuracaoNfeService.findAll(companyId, filtrarAtivas);
  }

  /**
   * Buscar configuração específica
   * GET /api/configuracao-nfe/:id
   */
  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ConfiguracaoNfeResponseDto> {
    const companyId = req.user.activeCompanyId;
    return this.configuracaoNfeService.findOne(id, companyId);
  }

  /**
   * Atualizar configuração
   * PUT /api/configuracao-nfe/:id
   */
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateConfiguracaoNfeDto,
  ): Promise<ConfiguracaoNfeResponseDto> {
    const companyId = req.user.activeCompanyId;
    return this.configuracaoNfeService.update(id, companyId, updateDto);
  }

  /**
   * Desativar configuração
   * DELETE /api/configuracao-nfe/:id
   */
  @Delete(':id')
  async remove(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const companyId = req.user.activeCompanyId;
    await this.configuracaoNfeService.remove(id, companyId);
    return { message: 'Configuração desativada com sucesso.' };
  }

  /**
   * Incrementar número atual
   * POST /api/configuracao-nfe/:id/incrementar
   */
  @Post(':id/incrementar')
  async incrementarNumero(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ numeroAtual: number }> {
    const companyId = req.user.activeCompanyId;
    const numeroAtual = await this.configuracaoNfeService.incrementarNumero(id, companyId);
    return { numeroAtual };
  }

  /**
   * Teste de conexão com banco
   * GET /api/configuracao-nfe/test
   */
  @Get('test')
  async testDatabase(): Promise<{ message: string; tableExists: boolean }> {
    try {
      const result = await this.configuracaoNfeService.testDatabase();
      return { message: 'Database test successful', tableExists: result };
    } catch (error) {
      return { message: `Database test failed: ${error.message}`, tableExists: false };
    }
  }

  /**
   * Teste de conexão com banco (sem autenticação)
   * GET /api/configuracao-nfe/test-db
   */
  @Get('test-db')
  async testDatabaseNoAuth(): Promise<{ message: string; tableExists: boolean }> {
    try {
      const result = await this.configuracaoNfeService.testDatabase();
      return { message: 'Database test successful', tableExists: result };
    } catch (error) {
      return { message: `Database test failed: ${error.message}`, tableExists: false };
    }
  }

  /**
   * Teste simples (sem autenticação)
   * GET /api/configuracao-nfe/test-simple
   */
  @Get('test-simple')
  async testSimple(): Promise<{ message: string }> {
    return { message: 'ConfiguracaoNfe controller working!' };
  }

  /**
   * Teste de criação sem criptografia
   * POST /api/configuracao-nfe/test-create
   */
  @Post('test-create')
  async testCreate(@Body() createDto: any): Promise<{ message: string; data: any }> {
    try {
      // Teste simples sem usar o serviço de criptografia
      return { 
        message: 'Test create successful', 
        data: createDto 
      };
    } catch (error) {
      return { 
        message: `Test create failed: ${error.message}`, 
        data: null 
      };
    }
  }
}



