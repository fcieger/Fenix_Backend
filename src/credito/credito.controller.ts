import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Ip,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreditoService } from './credito.service';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { AceitarPropostaDto } from './dto/aceitar-proposta.dto';
import { RecusarPropostaDto } from './dto/recusar-proposta.dto';
import { AprovarSolicitacaoDto } from './dto/aprovar-solicitacao.dto';
import { ReprovarSolicitacaoDto } from './dto/reprovar-solicitacao.dto';
import { UtilizarCapitalDto } from './dto/utilizar-capital.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreditoAdminGuard } from './guards/credito-admin.guard';
import { CreditoAtivoGuard } from './guards/credito-ativo.guard';

@Controller('credito')
@UseGuards(JwtAuthGuard)
export class CreditoController {
  constructor(private readonly creditoService: CreditoService) {}

  // ============================================
  // SOLICITAÇÕES DE CRÉDITO (Cliente)
  // ============================================

  @Post('solicitacoes')
  async criarSolicitacao(@Request() req, @Body() createDto: CreateSolicitacaoDto) {
    return await this.creditoService.criarSolicitacao(req.user.companyId, req.user.userId, createDto);
  }

  @Get('solicitacoes')
  async listarMinhasSolicitacoes(@Request() req) {
    return await this.creditoService.listarMinhasSolicitacoes(req.user.companyId);
  }

  @Get('solicitacoes/:id')
  async buscarSolicitacao(@Request() req, @Param('id') id: string) {
    return await this.creditoService.buscarSolicitacao(id, req.user.companyId);
  }

  @Patch('solicitacoes/:id')
  async atualizarSolicitacao(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateSolicitacaoDto) {
    return await this.creditoService.atualizarSolicitacao(id, req.user.companyId, updateDto);
  }

  @Delete('solicitacoes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelarSolicitacao(@Request() req, @Param('id') id: string) {
    await this.creditoService.cancelarSolicitacao(id, req.user.companyId);
  }

  // ============================================
  // PROPOSTAS (Cliente)
  // ============================================

  @Get('propostas')
  async listarMinhasPropostas(@Request() req) {
    return await this.creditoService.listarMinhasPropostas(req.user.companyId);
  }

  @Get('proposta/:id')
  async buscarProposta(@Request() req, @Param('id') id: string, @Ip() ip: string, @Headers('user-agent') userAgent: string) {
    const proposta = await this.creditoService.buscarProposta(id, req.user.companyId);
    
    // Registrar visualização
    await this.creditoService.registrarVisualizacao(id, req.user.userId, ip, userAgent);
    
    return proposta;
  }

  @Post('proposta/:id/aceitar')
  async aceitarProposta(
    @Request() req,
    @Param('id') id: string,
    @Body() aceitarDto: AceitarPropostaDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return await this.creditoService.aceitarProposta(id, req.user.companyId, req.user.userId, aceitarDto, ip, userAgent);
  }

  @Post('proposta/:id/recusar')
  async recusarProposta(@Request() req, @Param('id') id: string, @Body() recusarDto: RecusarPropostaDto) {
    return await this.creditoService.recusarProposta(id, req.user.companyId, recusarDto);
  }

  // ============================================
  // CAPITAL DE GIRO (Cliente)
  // ============================================

  @Get('capital-giro')
  @UseGuards(CreditoAtivoGuard)
  async buscarMeuCapitalGiro(@Request() req) {
    return await this.creditoService.buscarMeuCapitalGiro(req.user.companyId);
  }

  @Post('capital-giro/utilizar')
  @UseGuards(CreditoAtivoGuard)
  async utilizarCapital(@Request() req, @Body() utilizarDto: UtilizarCapitalDto) {
    return await this.creditoService.utilizarCapital(req.user.companyId, utilizarDto);
  }

  @Get('capital-giro/extrato')
  @UseGuards(CreditoAtivoGuard)
  async buscarExtrato(@Request() req, @Query() filtros: any) {
    return await this.creditoService.buscarExtratoComFiltros(req.user.companyId, filtros);
  }

  // ============================================
  // ADMIN - GESTÃO DE SOLICITAÇÕES
  // ============================================

  @Get('admin/dashboard')
  @UseGuards(CreditoAdminGuard)
  async buscarDashboardAdmin() {
    return await this.creditoService.buscarDashboardAdmin();
  }

  @Get('admin/solicitacoes')
  @UseGuards(CreditoAdminGuard)
  async listarTodasSolicitacoes(@Query() filtros: any) {
    return await this.creditoService.listarTodasSolicitacoes(filtros);
  }

  @Get('admin/solicitacoes/:id')
  @UseGuards(CreditoAdminGuard)
  async buscarSolicitacaoAdmin(@Param('id') id: string) {
    return await this.creditoService.buscarSolicitacao(id);
  }

  @Post('admin/solicitacoes/:id/aprovar')
  @UseGuards(CreditoAdminGuard)
  async aprovarSolicitacao(@Request() req, @Param('id') id: string, @Body() aprovarDto: AprovarSolicitacaoDto) {
    return await this.creditoService.aprovarSolicitacao(id, req.user.userId, aprovarDto);
  }

  @Post('admin/solicitacoes/:id/reprovar')
  @UseGuards(CreditoAdminGuard)
  async reprovarSolicitacao(@Param('id') id: string, @Body() reprovarDto: ReprovarSolicitacaoDto) {
    return await this.creditoService.reprovarSolicitacao(id, reprovarDto);
  }

  // ============================================
  // ANTECIPAÇÃO (Cliente)
  // ============================================

  @Get('antecipacao/recebiveis')
  async listarRecebiveis(@Request() req) {
    return await this.creditoService.listarRecebiveis(req.user.companyId);
  }

  @Post('antecipacao/simular')
  async simularAntecipacao(@Request() req, @Body() data: { titulosIds: string[] }) {
    return await this.creditoService.simularAntecipacao(req.user.companyId, data.titulosIds);
  }

  @Post('antecipacao/solicitar')
  async solicitarAntecipacao(@Request() req, @Body() data: { titulosIds: string[] }) {
    return await this.creditoService.solicitarAntecipacao(req.user.companyId, data.titulosIds, req.user.userId);
  }

  @Get('antecipacao/historico')
  async buscarHistoricoAntecipacao(@Request() req) {
    return await this.creditoService.buscarHistoricoAntecipacao(req.user.companyId);
  }


  // ============================================
  // ADMIN - CLIENTES
  // ============================================

  @Get('admin/clientes')
  @UseGuards(CreditoAdminGuard)
  async listarClientes(@Query() filtros: any) {
    return await this.creditoService.listarClientes(filtros);
  }

  @Get('admin/clientes/:id')
  @UseGuards(CreditoAdminGuard)
  async buscarDadosCliente(@Param('id') empresaId: string) {
    return await this.creditoService.buscarDadosCliente(empresaId);
  }

  // ============================================
  // ADMIN - SOLICITAÇÕES
  // ============================================

  @Get('admin/solicitacoes')
  @UseGuards(CreditoAdminGuard)
  async listarSolicitacoesAdmin(@Query() filtros: any) {
    return await this.creditoService.listarSolicitacoesAdmin(filtros);
  }

  // ============================================
  // ADMIN - DOCUMENTOS
  // ============================================

  @Patch('admin/documento/:id/validar')
  @UseGuards(CreditoAdminGuard)
  async validarDocumento(@Param('id') id: string, @Request() req, @Body() body: any) {
    return await this.creditoService.validarDocumento(id, req.user.userId, body.observacoes);
  }

  @Patch('admin/documento/:id/rejeitar')
  @UseGuards(CreditoAdminGuard)
  async rejeitarDocumento(@Param('id') id: string, @Request() req, @Body() body: any) {
    return await this.creditoService.rejeitarDocumento(id, req.user.userId, body.motivo);
  }

  // ============================================
  // ADMIN - GESTÃO DE PROPOSTAS
  // ============================================

  @Get('admin/propostas')
  @UseGuards(CreditoAdminGuard)
  async listarTodasPropostas(@Query() filtros: any) {
    return await this.creditoService.listarTodasPropostas(filtros);
  }

  @Post('admin/proposta/criar')
  @UseGuards(CreditoAdminGuard)
  async criarProposta(@Request() req, @Body() createDto: CreatePropostaDto) {
    return await this.creditoService.criarProposta(req.user.userId, createDto);
  }

  @Post('admin/proposta/:id/ativar-credito')
  @UseGuards(CreditoAdminGuard)
  async ativarCapitalGiro(@Param('id') propostaId: string) {
    return await this.creditoService.ativarCapitalGiro(propostaId);
  }

  // ============================================
  // ADMIN - CAPITAL DE GIRO
  // ============================================

  @Get('admin/capital-giro/todos')
  @UseGuards(CreditoAdminGuard)
  async listarTodosCapitalGiro() {
    return await this.creditoService.listarTodosCapitalGiro();
  }

  @Patch('admin/capital-giro/:id/suspender')
  @UseGuards(CreditoAdminGuard)
  async suspenderCapitalGiro(@Param('id') id: string, @Body() body: any) {
    return await this.creditoService.suspenderCapitalGiro(id, body.motivo);
  }

  @Patch('admin/capital-giro/:id/reativar')
  @UseGuards(CreditoAdminGuard)
  async reativarCapitalGiro(@Param('id') id: string) {
    return await this.creditoService.reativarCapitalGiro(id);
  }
}

