import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { NaturezaOperacaoService } from './natureza-operacao.service';
import { CreateNaturezaOperacaoDto } from './dto/create-natureza-operacao.dto';
import { UpdateNaturezaOperacaoDto } from './dto/update-natureza-operacao.dto';
import { ConfiguracaoEstadoDto } from './dto/configuracao-estado.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('natureza-operacao')
@UseGuards(JwtAuthGuard)
export class NaturezaOperacaoController {
  constructor(private readonly naturezaOperacaoService: NaturezaOperacaoService) {}

  @Post()
  create(@Body() createNaturezaOperacaoDto: CreateNaturezaOperacaoDto, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return this.naturezaOperacaoService.create(createNaturezaOperacaoDto, companyId);
  }

  @Get()
  findAll(@Request() req) {
    return this.naturezaOperacaoService.findAll(req.user.activeCompanyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.naturezaOperacaoService.findOne(id, req.user.activeCompanyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNaturezaOperacaoDto: UpdateNaturezaOperacaoDto, @Request() req) {
    return this.naturezaOperacaoService.update(id, updateNaturezaOperacaoDto, req.user.activeCompanyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.naturezaOperacaoService.remove(id, req.user.activeCompanyId);
  }

  @Get(':id/configuracao-estados')
  getConfiguracaoEstados(@Param('id') id: string, @Request() req) {
    console.log('=== GET CONFIGURAÇÃO ESTADOS CONTROLLER ===');
    console.log('ID:', id);
    console.log('User:', req.user);
    console.log('CompanyId:', req.user.activeCompanyId);
    
    const companyId = req.user.activeCompanyId;
    return this.naturezaOperacaoService.getConfiguracaoEstados(id, companyId);
  }

  @Post(':id/configuracao-estados')
  async saveConfiguracaoEstados(
    @Param('id') id: string, 
    @Body() configuracaoEstados: ConfiguracaoEstadoDto[], 
    @Request() req
  ) {
    try {
      console.log('=== SAVE CONFIGURAÇÃO ESTADOS ===');
      console.log('ID:', id);
      console.log('CompanyId:', req.user.activeCompanyId);
      console.log('Configurações recebidas:', JSON.stringify(configuracaoEstados, null, 2));
      
      const companyId = req.user.activeCompanyId;
      const result = await this.naturezaOperacaoService.saveConfiguracaoEstados(id, configuracaoEstados, companyId);
      console.log('✅ Configurações salvas com sucesso');
      return result;
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      throw error;
    }
  }
}




