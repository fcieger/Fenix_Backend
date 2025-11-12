import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { SolicitacaoCredito } from './entities/solicitacao-credito.entity';
import { DocumentoCredito } from './entities/documento-credito.entity';
import { AnaliseCredito } from './entities/analise-credito.entity';
import { PropostaCredito } from './entities/proposta-credito.entity';
import { CapitalGiro } from './entities/capital-giro.entity';
import { MovimentacaoCapitalGiro } from './entities/movimentacao-capital-giro.entity';
import { AntecipacaoRecebiveis } from './entities/antecipacao-recebiveis.entity';
import { VisualizacaoProposta } from './entities/visualizacao-proposta.entity';
import { CreateSolicitacaoDto } from './dto/create-solicitacao.dto';
import { UpdateSolicitacaoDto } from './dto/update-solicitacao.dto';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { AceitarPropostaDto } from './dto/aceitar-proposta.dto';
import { RecusarPropostaDto } from './dto/recusar-proposta.dto';
import { AprovarSolicitacaoDto } from './dto/aprovar-solicitacao.dto';
import { ReprovarSolicitacaoDto } from './dto/reprovar-solicitacao.dto';
import { UtilizarCapitalDto } from './dto/utilizar-capital.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreditoService {
  constructor(
    @InjectRepository(SolicitacaoCredito)
    private solicitacaoRepository: Repository<SolicitacaoCredito>,
    @InjectRepository(DocumentoCredito)
    private documentoRepository: Repository<DocumentoCredito>,
    @InjectRepository(AnaliseCredito)
    private analiseRepository: Repository<AnaliseCredito>,
    @InjectRepository(PropostaCredito)
    private propostaRepository: Repository<PropostaCredito>,
    @InjectRepository(CapitalGiro)
    private capitalGiroRepository: Repository<CapitalGiro>,
    @InjectRepository(MovimentacaoCapitalGiro)
    private movimentacaoRepository: Repository<MovimentacaoCapitalGiro>,
    @InjectRepository(AntecipacaoRecebiveis)
    private antecipacaoRepository: Repository<AntecipacaoRecebiveis>,
    @InjectRepository(VisualizacaoProposta)
    private visualizacaoRepository: Repository<VisualizacaoProposta>,
    private notificationsService: NotificationsService,
  ) {}

  // ============================================
  // SOLICITAÇÕES DE CRÉDITO
  // ============================================

  async criarSolicitacao(empresaId: string, usuarioId: string, createDto: CreateSolicitacaoDto): Promise<SolicitacaoCredito> {
    // Verificar se já existe solicitação ativa
    const solicitacaoAtiva = await this.solicitacaoRepository.findOne({
      where: {
        empresaId,
        status: Not('reprovado'),
        deletedAt: IsNull(),
      },
    });

    if (solicitacaoAtiva) {
      throw new BadRequestException('Já existe uma solicitação de crédito ativa para esta empresa');
    }

    const solicitacao = this.solicitacaoRepository.create({
      ...createDto,
      empresaId,
      usuarioId,
      status: 'em_analise',
    });

    const solicitacaoSalva = await this.solicitacaoRepository.save(solicitacao);

    // Notificar cliente
    await this.notificationsService.notificarSolicitacaoCriada(
      usuarioId,
      solicitacaoSalva.id,
      createDto.valorSolicitado,
    );

    return solicitacaoSalva;
  }

  async listarMinhasSolicitacoes(empresaId: string): Promise<SolicitacaoCredito[]> {
    return await this.solicitacaoRepository.find({
      where: { empresaId, deletedAt: IsNull() },
      relations: ['documentos', 'propostas'],
      order: { createdAt: 'DESC' },
    });
  }

  async buscarSolicitacao(id: string, empresaId?: string): Promise<SolicitacaoCredito> {
    const where: any = { id, deletedAt: IsNull() };
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const solicitacao = await this.solicitacaoRepository.findOne({
      where,
      relations: ['documentos', 'analises', 'propostas', 'empresa', 'usuario'],
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    return solicitacao;
  }

  async atualizarSolicitacao(id: string, empresaId: string, updateDto: UpdateSolicitacaoDto): Promise<SolicitacaoCredito> {
    const solicitacao = await this.buscarSolicitacao(id, empresaId);

    if (!solicitacao.podeSerCancelada()) {
      throw new BadRequestException('Esta solicitação não pode mais ser alterada');
    }

    Object.assign(solicitacao, updateDto);
    return await this.solicitacaoRepository.save(solicitacao);
  }

  async cancelarSolicitacao(id: string, empresaId: string): Promise<void> {
    const solicitacao = await this.buscarSolicitacao(id, empresaId);

    if (!solicitacao.podeSerCancelada()) {
      throw new BadRequestException('Esta solicitação não pode ser cancelada');
    }

    await this.solicitacaoRepository.softDelete(id);
  }

  // ============================================
  // ADMIN - GESTÃO DE SOLICITAÇÕES
  // ============================================

  async listarTodasSolicitacoes(filtros?: any): Promise<SolicitacaoCredito[]> {
    const query = this.solicitacaoRepository.createQueryBuilder('solicitacao')
      .leftJoinAndSelect('solicitacao.empresa', 'empresa')
      .leftJoinAndSelect('solicitacao.usuario', 'usuario')
      .leftJoinAndSelect('solicitacao.documentos', 'documentos')
      .where('solicitacao.deletedAt IS NULL');

    if (filtros?.status) {
      query.andWhere('solicitacao.status = :status', { status: filtros.status });
    }

    if (filtros?.empresaId) {
      query.andWhere('solicitacao.empresaId = :empresaId', { empresaId: filtros.empresaId });
    }

    query.orderBy('solicitacao.createdAt', 'DESC');

    return await query.getMany();
  }

  async aprovarSolicitacao(id: string, analistaId: string, aprovarDto: AprovarSolicitacaoDto): Promise<SolicitacaoCredito> {
    const solicitacao = await this.buscarSolicitacao(id);

    if (solicitacao.status !== 'em_analise' && solicitacao.status !== 'documentacao_completa') {
      throw new BadRequestException('Esta solicitação não pode ser aprovada no momento');
    }

    // Criar análise de crédito
    const analise = this.analiseRepository.create({
      solicitacaoId: id,
      analistaId,
      ...aprovarDto,
      status: 'aprovado',
    });
    await this.analiseRepository.save(analise);

    // Atualizar solicitação
    solicitacao.status = 'aprovado';
    solicitacao.aprovadoPor = analistaId;
    solicitacao.dataAprovacao = new Date();

    const solicitacaoAtualizada = await this.solicitacaoRepository.save(solicitacao);

    // Notificar cliente
    await this.notificationsService.notificarAprovacao(
      solicitacao.usuarioId,
      solicitacao.id,
    );

    return solicitacaoAtualizada;
  }

  async reprovarSolicitacao(id: string, reprovarDto: ReprovarSolicitacaoDto): Promise<SolicitacaoCredito> {
    const solicitacao = await this.buscarSolicitacao(id);

    solicitacao.status = 'reprovado';
    solicitacao.motivoReprovacao = reprovarDto.motivoReprovacao;
    solicitacao.dataReprovacao = new Date();

    const solicitacaoAtualizada = await this.solicitacaoRepository.save(solicitacao);

    // Notificar cliente
    await this.notificationsService.notificarReprovacao(
      solicitacao.usuarioId,
      solicitacao.id,
      reprovarDto.motivoReprovacao,
    );

    return solicitacaoAtualizada;
  }

  // ============================================
  // PROPOSTAS DE CRÉDITO
  // ============================================

  async criarProposta(enviadaPor: string, createDto: CreatePropostaDto): Promise<PropostaCredito> {
    const solicitacao = await this.buscarSolicitacao(createDto.solicitacaoId);

    if (solicitacao.status !== 'aprovado') {
      throw new BadRequestException('A solicitação deve estar aprovada para criar uma proposta');
    }

    // Gerar número único da proposta
    const ano = new Date().getFullYear();
    const count = await this.propostaRepository.count();
    const numeroProposta = `PROP-${ano}-${String(count + 1).padStart(5, '0')}`;

    // Calcular valores
    const valorParcela = this.calcularParcela(createDto.valorAprovado, createDto.taxaJuros, createDto.prazoMeses);
    const cet = createDto.taxaJuros + createDto.taxaIntermediacao;
    const iof = createDto.valorAprovado * 0.0038; // IOF aproximado
    const valorTotalPagar = valorParcela * createDto.prazoMeses;

    // Calcular data de expiração
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + createDto.diasValidade);

    const proposta = this.propostaRepository.create({
      solicitacaoId: createDto.solicitacaoId,
      empresaId: solicitacao.empresaId,
      numeroProposta,
      instituicaoFinanceira: createDto.instituicaoFinanceira,
      valorAprovado: createDto.valorAprovado,
      taxaJuros: createDto.taxaJuros,
      taxaIntermediacao: createDto.taxaIntermediacao,
      prazoMeses: createDto.prazoMeses,
      valorParcela,
      cet,
      iof,
      valorTotalPagar,
      observacoes: createDto.observacoes,
      condicoesGerais: createDto.condicoesGerais,
      dataExpiracao,
      enviadaPor,
      status: 'enviada',
    });

    const propostaSalva = await this.propostaRepository.save(proposta);

    // Atualizar status da solicitação
    solicitacao.status = 'proposta_enviada';
    await this.solicitacaoRepository.save(solicitacao);

    // Notificar cliente
    await this.notificationsService.notificarPropostaEnviada(
      solicitacao.usuarioId,
      propostaSalva.id,
      propostaSalva.valorAprovado,
    );

    return propostaSalva;
  }

  async listarMinhasPropostas(empresaId: string): Promise<PropostaCredito[]> {
    return await this.propostaRepository.find({
      where: { empresaId, deletedAt: IsNull() },
      relations: ['solicitacao'],
      order: { createdAt: 'DESC' },
    });
  }

  async buscarProposta(id: string, empresaId?: string): Promise<PropostaCredito> {
    const where: any = { id, deletedAt: IsNull() };
    if (empresaId) {
      where.empresaId = empresaId;
    }

    const proposta = await this.propostaRepository.findOne({
      where,
      relations: ['solicitacao', 'empresa'],
    });

    if (!proposta) {
      throw new NotFoundException('Proposta não encontrada');
    }

    return proposta;
  }

  async registrarVisualizacao(propostaId: string, usuarioId: string, ip: string, userAgent: string): Promise<void> {
    const proposta = await this.buscarProposta(propostaId);

    // Registrar visualização
    const visualizacao = this.visualizacaoRepository.create({
      propostaId,
      usuarioId,
      ipAddress: ip,
      userAgent,
    });
    await this.visualizacaoRepository.save(visualizacao);

    // Atualizar proposta se for primeira visualização
    if (!proposta.visualizadaEm) {
      proposta.visualizadaEm = new Date();
      proposta.status = 'visualizada';
      await this.propostaRepository.save(proposta);
    }
  }

  async aceitarProposta(id: string, empresaId: string, usuarioId: string, aceitarDto: AceitarPropostaDto, ip: string, userAgent: string): Promise<PropostaCredito> {
    const proposta = await this.buscarProposta(id, empresaId);

    if (!proposta.aguardandoResposta()) {
      throw new BadRequestException('Esta proposta não está disponível para aceite');
    }

    if (proposta.estaExpirada()) {
      throw new BadRequestException('Esta proposta está expirada');
    }

    // Verificar senha (assumindo que queremos validar a senha do usuário)
    // TODO: Implementar validação de senha do usuário
    // const user = await this.userRepository.findOne({ where: { id: usuarioId } });
    // const senhaValida = await bcrypt.compare(aceitarDto.senha, user.password);
    // if (!senhaValida) {
    //   throw new BadRequestException('Senha inválida');
    // }

    proposta.status = 'aceita';
    proposta.dataAceite = new Date();
    proposta.ipAceite = ip;
    proposta.userAgent = userAgent;

    const propostaAtualizada = await this.propostaRepository.save(proposta);

    // Notificar admin (todos os admins podem receber - por ora enviando ao criador da proposta)
    if (proposta.enviadaPor) {
      const solicitacao = await this.buscarSolicitacao(proposta.solicitacaoId);
      await this.notificationsService.notificarPropostaAceita(
        proposta.enviadaPor,
        propostaAtualizada.id,
        solicitacao.empresa?.name || 'Cliente',
      );
    }

    return propostaAtualizada;
  }

  async recusarProposta(id: string, empresaId: string, recusarDto: RecusarPropostaDto): Promise<PropostaCredito> {
    const proposta = await this.buscarProposta(id, empresaId);

    if (!proposta.aguardandoResposta()) {
      throw new BadRequestException('Esta proposta não está disponível para recusa');
    }

    proposta.status = 'recusada';
    proposta.dataRecusa = new Date();
    proposta.motivoRecusa = recusarDto.motivo;
    if (recusarDto.comentario) {
      proposta.observacoes = (proposta.observacoes || '') + '\n\nMotivo da recusa: ' + recusarDto.comentario;
    }

    return await this.propostaRepository.save(proposta);
  }

  // ============================================
  // CAPITAL DE GIRO
  // ============================================

  async ativarCapitalGiro(propostaId: string): Promise<CapitalGiro> {
    const proposta = await this.buscarProposta(propostaId);

    if (!proposta.foiAceita()) {
      throw new BadRequestException('A proposta deve estar aceita para ativar o capital de giro');
    }

    // Verificar se já existe capital ativo
    const capitalExistente = await this.capitalGiroRepository.findOne({
      where: {
        empresaId: proposta.empresaId,
        status: 'ativo',
      },
    });

    if (capitalExistente) {
      throw new BadRequestException('Já existe um capital de giro ativo para esta empresa');
    }

    // Calcular data de vencimento
    const dataVencimento = new Date();
    dataVencimento.setMonth(dataVencimento.getMonth() + proposta.prazoMeses);

    const capital = this.capitalGiroRepository.create({
      solicitacaoId: proposta.solicitacaoId,
      empresaId: proposta.empresaId,
      propostaId: proposta.id,
      valorLiberado: proposta.valorAprovado,
      valorUtilizado: 0,
      limiteDisponivel: proposta.valorAprovado,
      taxaJuros: proposta.taxaJuros,
      prazoMeses: proposta.prazoMeses,
      dataVencimento,
      status: 'ativo',
    });

    return await this.capitalGiroRepository.save(capital);
  }

  async buscarMeuCapitalGiro(empresaId: string): Promise<CapitalGiro> {
    const capital = await this.capitalGiroRepository.findOne({
      where: {
        empresaId,
        status: 'ativo',
        deletedAt: IsNull(),
      },
      relations: ['proposta', 'movimentacoes'],
    });

    if (!capital) {
      throw new NotFoundException('Capital de giro não encontrado ou inativo');
    }

    return capital;
  }

  async utilizarCapital(empresaId: string, utilizarDto: UtilizarCapitalDto): Promise<MovimentacaoCapitalGiro> {
    const capital = await this.buscarMeuCapitalGiro(empresaId);

    if (!capital.temLimiteDisponivel(utilizarDto.valor)) {
      throw new BadRequestException(`Limite insuficiente. Disponível: R$ ${capital.calcularLimiteDisponivel().toFixed(2)}`);
    }

    const saldoAnterior = capital.valorUtilizado;
    const saldoPosterior = saldoAnterior + utilizarDto.valor;

    // Criar movimentação
    const movimentacao = this.movimentacaoRepository.create({
      capitalGiroId: capital.id,
      tipo: 'utilizacao',
      valor: utilizarDto.valor,
      descricao: utilizarDto.descricao,
      saldoAnterior,
      saldoPosterior,
    });
    await this.movimentacaoRepository.save(movimentacao);

    // Atualizar capital
    capital.valorUtilizado = saldoPosterior;
    capital.limiteDisponivel = capital.calcularLimiteDisponivel();
    await this.capitalGiroRepository.save(capital);

    // Notificar cliente
    await this.notificationsService.notificarUtilizacaoCapital(
      capital.empresaId,
      utilizarDto.valor,
      capital.limiteDisponivel,
    );

    return movimentacao;
  }

  async buscarExtrato(empresaId: string): Promise<MovimentacaoCapitalGiro[]> {
    const capital = await this.buscarMeuCapitalGiro(empresaId);

    return await this.movimentacaoRepository.find({
      where: { capitalGiroId: capital.id },
      order: { createdAt: 'DESC' },
    });
  }

  // ============================================
  // ANTECIPAÇÃO DE RECEBÍVEIS
  // ============================================

  async listarRecebiveis(empresaId: string): Promise<any[]> {
    // TODO: Integrar com módulo financeiro para buscar títulos a receber
    // Por enquanto retorna array vazio
    return [];
  }

  async simularAntecipacao(empresaId: string, titulosIds: string[]): Promise<any> {
    // TODO: Implementar simulação de antecipação
    // Buscar títulos, calcular valor total, aplicar taxa de desconto, calcular IOF
    const valorTotal = 10000; // Exemplo
    const taxaDesconto = 2.5;
    const diasMedio = 30;
    const desconto = (valorTotal * taxaDesconto * diasMedio) / 3000;
    const iof = valorTotal * 0.0038;
    const valorLiquido = valorTotal - desconto - iof;

    return {
      valorTotal,
      taxaDesconto,
      desconto,
      iof,
      valorLiquido,
      prazoMedio: diasMedio,
    };
  }

  async solicitarAntecipacao(empresaId: string, titulosIds: string[], usuarioId: string): Promise<AntecipacaoRecebiveis> {
    // TODO: Validar títulos e criar solicitação
    const simulacao = await this.simularAntecipacao(empresaId, titulosIds);

    const antecipacao = this.antecipacaoRepository.create({
      empresaId,
      valorTotalRecebiveis: simulacao.valorTotal,
      valorAntecipado: simulacao.valorTotal - simulacao.desconto,
      taxaDesconto: simulacao.taxaDesconto,
      valorLiquido: simulacao.valorLiquido,
      quantidadeTitulos: titulosIds.length,
      status: 'pendente',
    });

    const antecipacaoSalva = await this.antecipacaoRepository.save(antecipacao);

    // Notificar cliente e admin
    await this.notificationsService.notificarAntecipacaoSolicitada(
      usuarioId,
      antecipacaoSalva.id,
      simulacao.valorLiquido,
    );

    return antecipacaoSalva;
  }

  async buscarHistoricoAntecipacao(empresaId: string): Promise<AntecipacaoRecebiveis[]> {
    return await this.antecipacaoRepository.find({
      where: { empresaId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  // ============================================
  // ADMIN - CLIENTES
  // ============================================

  async listarClientes(filtros?: any): Promise<any[]> {
    const query = this.solicitacaoRepository
      .createQueryBuilder('solicitacao')
      .leftJoinAndSelect('solicitacao.empresa', 'empresa')
      .select([
        'empresa.id',
        'empresa.name',
        'empresa.cnpj',
        'COUNT(solicitacao.id) as totalSolicitacoes',
        'SUM(CASE WHEN solicitacao.status = \'aprovado\' THEN 1 ELSE 0 END) as aprovadas',
        'MAX(solicitacao.createdAt) as ultimaSolicitacao',
      ])
      .where('solicitacao.deletedAt IS NULL')
      .groupBy('empresa.id, empresa.name, empresa.cnpj');

    return await query.getRawMany();
  }

  async buscarDadosCliente(empresaId: string): Promise<any> {
    const solicitacoes = await this.solicitacaoRepository.find({
      where: { empresaId, deletedAt: IsNull() },
      relations: ['documentos', 'propostas'],
      order: { createdAt: 'DESC' },
    });

    const capitalGiro = await this.capitalGiroRepository.findOne({
      where: { empresaId, status: 'ativo' },
    });

    return {
      solicitacoes,
      capitalGiro,
      totalSolicitacoes: solicitacoes.length,
      aprovadas: solicitacoes.filter(s => s.status === 'aprovado').length,
    };
  }

  // ============================================
  // ADMIN - PROPOSTAS
  // ============================================

  async listarTodasPropostas(filtros?: any): Promise<PropostaCredito[]> {
    const query = this.propostaRepository.createQueryBuilder('proposta')
      .leftJoinAndSelect('proposta.empresa', 'empresa')
      .leftJoinAndSelect('proposta.solicitacao', 'solicitacao')
      .where('proposta.deletedAt IS NULL');

    if (filtros?.status) {
      query.andWhere('proposta.status = :status', { status: filtros.status });
    }

    if (filtros?.empresaId) {
      query.andWhere('proposta.empresaId = :empresaId', { empresaId: filtros.empresaId });
    }

    query.orderBy('proposta.createdAt', 'DESC');

    return await query.getMany();
  }

  // ============================================
  // MÉTODOS AUXILIARES
  // ============================================

  private calcularParcela(valor: number, taxaMensal: number, prazoMeses: number): number {
    const taxa = taxaMensal / 100;
    const numerador = valor * taxa * Math.pow(1 + taxa, prazoMeses);
    const denominador = Math.pow(1 + taxa, prazoMeses) - 1;
    return numerador / denominador;
  }

  // ============================================
  // DASHBOARD E MÉTRICAS
  // ============================================

  async buscarDashboardAdmin(): Promise<any> {
    const totalSolicitacoes = await this.solicitacaoRepository.count({ where: { deletedAt: IsNull() } });
    const emAnalise = await this.solicitacaoRepository.count({ where: { status: 'em_analise', deletedAt: IsNull() } });
    const aprovadas = await this.solicitacaoRepository.count({ where: { status: 'aprovado', deletedAt: IsNull() } });
    const reprovadas = await this.solicitacaoRepository.count({ where: { status: 'reprovado', deletedAt: IsNull() } });
    const aguardandoDocs = await this.solicitacaoRepository.count({ where: { status: 'aguardando_documentos', deletedAt: IsNull() } });

    const propostasPendentes = await this.propostaRepository.count({
      where: { status: 'enviada', deletedAt: IsNull() },
    });

    const documentosPendentes = await this.documentoRepository.count({
      where: { status: 'pendente', deletedAt: IsNull() },
    });

    // Calcular valores
    const solicitacoesAprovadas = await this.solicitacaoRepository.find({
      where: { status: 'aprovado', deletedAt: IsNull() },
      select: ['valorSolicitado'],
    });
    const valorTotalAprovado = solicitacoesAprovadas.reduce((acc, s) => acc + Number(s.valorSolicitado), 0);

    const solicitacoesEmAnalise = await this.solicitacaoRepository.find({
      where: { status: 'em_analise', deletedAt: IsNull() },
      select: ['valorSolicitado'],
    });
    const valorEmAnalise = solicitacoesEmAnalise.reduce((acc, s) => acc + Number(s.valorSolicitado), 0);

    // Taxa de aprovação
    const totalFinalizadas = aprovadas + reprovadas;
    const taxaAprovacao = totalFinalizadas > 0 ? ((aprovadas / totalFinalizadas) * 100).toFixed(2) : 0;

    // Capital de giro ativo
    const capitalGiroAtivo = await this.capitalGiroRepository.count({ where: { status: 'ativo' } });

    // Últimas solicitações
    const ultimasSolicitacoes = await this.solicitacaoRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['empresa'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      totalSolicitacoes,
      emAnalise,
      aprovadas,
      reprovadas,
      aguardandoDocs,
      propostasPendentes,
      documentosPendentes,
      valorTotalAprovado,
      valorEmAnalise,
      taxaAprovacao: Number(taxaAprovacao),
      capitalGiroAtivo,
      ultimasSolicitacoes,
    };
  }

  async listarSolicitacoesAdmin(filtros?: any): Promise<any> {
    const query = this.solicitacaoRepository.createQueryBuilder('solicitacao')
      .leftJoinAndSelect('solicitacao.empresa', 'empresa')
      .leftJoinAndSelect('solicitacao.documentos', 'documentos')
      .where('solicitacao.deletedAt IS NULL');

    // Filtros avançados
    if (filtros?.status) {
      query.andWhere('solicitacao.status = :status', { status: filtros.status });
    }
    if (filtros?.empresaId) {
      query.andWhere('solicitacao.empresaId = :empresaId', { empresaId: filtros.empresaId });
    }
    if (filtros?.dataInicio) {
      query.andWhere('solicitacao.createdAt >= :dataInicio', { dataInicio: filtros.dataInicio });
    }
    if (filtros?.dataFim) {
      query.andWhere('solicitacao.createdAt <= :dataFim', { dataFim: filtros.dataFim });
    }
    if (filtros?.valorMin) {
      query.andWhere('solicitacao.valorSolicitado >= :valorMin', { valorMin: filtros.valorMin });
    }
    if (filtros?.valorMax) {
      query.andWhere('solicitacao.valorSolicitado <= :valorMax', { valorMax: filtros.valorMax });
    }

    // Ordenação customizável
    const orderBy = filtros?.orderBy || 'createdAt';
    const order = filtros?.order === 'ASC' ? 'ASC' : 'DESC';
    query.orderBy(`solicitacao.${orderBy}`, order);

    // Paginação
    const page = parseInt(filtros?.page) || 1;
    const limit = parseInt(filtros?.limit) || 20;
    const skip = (page - 1) * limit;

    const [solicitacoes, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: solicitacoes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Validação de documentos Admin
  async validarDocumento(id: string, adminId: string, observacoes?: string): Promise<DocumentoCredito> {
    const documento = await this.documentoRepository.findOne({ 
      where: { id },
      relations: ['solicitacao'],
    });
    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    documento.status = 'aprovado';
    documento.validadoPor = adminId;
    documento.dataValidacao = new Date();
    if (observacoes) {
      documento.observacoes = observacoes;
    }

    const documentoAtualizado = await this.documentoRepository.save(documento);

    // Notificar cliente
    if (documento.solicitacao?.usuarioId) {
      await this.notificationsService.notificarDocumentoValidado(
        documento.solicitacao.usuarioId,
        documento.nomeArquivo,
      );
    }

    return documentoAtualizado;
  }

  async rejeitarDocumento(id: string, adminId: string, motivo: string): Promise<DocumentoCredito> {
    const documento = await this.documentoRepository.findOne({ 
      where: { id },
      relations: ['solicitacao'],
    });
    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    documento.status = 'reprovado';
    documento.validadoPor = adminId;
    documento.dataValidacao = new Date();
    documento.observacoes = motivo;

    const documentoAtualizado = await this.documentoRepository.save(documento);

    // Notificar cliente
    if (documento.solicitacao?.usuarioId) {
      await this.notificationsService.notificarDocumentoRejeitado(
        documento.solicitacao.usuarioId,
        documento.nomeArquivo,
        motivo,
      );
    }

    return documentoAtualizado;
  }

  // Extrato com filtros
  async buscarExtratoComFiltros(empresaId: string, filtros?: any): Promise<any> {
    const capital = await this.buscarMeuCapitalGiro(empresaId);

    const query = this.movimentacaoRepository.createQueryBuilder('mov')
      .where('mov.capitalGiroId = :capitalGiroId', { capitalGiroId: capital.id });

    // Filtros
    if (filtros?.dataInicio) {
      query.andWhere('mov.createdAt >= :dataInicio', { dataInicio: filtros.dataInicio });
    }
    if (filtros?.dataFim) {
      query.andWhere('mov.createdAt <= :dataFim', { dataFim: filtros.dataFim });
    }
    if (filtros?.tipo) {
      query.andWhere('mov.tipo = :tipo', { tipo: filtros.tipo });
    }

    query.orderBy('mov.createdAt', 'DESC');

    // Paginação
    const page = parseInt(filtros?.page) || 1;
    const limit = parseInt(filtros?.limit) || 50;
    const skip = (page - 1) * limit;

    const [movimentacoes, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: movimentacoes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // APIs Admin Capital de Giro
  async listarTodosCapitalGiro(): Promise<CapitalGiro[]> {
    return await this.capitalGiroRepository.find({
      relations: ['empresa'],
      order: { createdAt: 'DESC' },
    });
  }

  async suspenderCapitalGiro(id: string, motivo: string): Promise<CapitalGiro> {
    const capital = await this.capitalGiroRepository.findOne({ where: { id } });
    if (!capital) {
      throw new NotFoundException('Capital de giro não encontrado');
    }

    capital.status = 'suspenso';
    return await this.capitalGiroRepository.save(capital);
  }

  async reativarCapitalGiro(id: string): Promise<CapitalGiro> {
    const capital = await this.capitalGiroRepository.findOne({ where: { id } });
    if (!capital) {
      throw new NotFoundException('Capital de giro não encontrado');
    }

    capital.status = 'ativo';
    return await this.capitalGiroRepository.save(capital);
  }
}

