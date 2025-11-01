import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm';
import { PedidoVenda, StatusPedidoVenda } from './entities/pedido-venda.entity';
import { PedidoVendaItem } from './entities/pedido-venda-item.entity';
import { CreatePedidoVendaDto } from './dto/create-pedido-venda.dto';
import { UpdatePedidoVendaDto } from './dto/update-pedido-venda.dto';
import { CreatePedidoVendaFromOrcamentoDto } from './dto/create-from-orcamento.dto';
import { OrcamentosService } from '../orcamentos/orcamentos.service';
import { StatusOrcamento } from '../orcamentos/entities/orcamento.entity';

@Injectable()
export class PedidosVendaService {
  constructor(
    @InjectRepository(PedidoVenda) private readonly repo: Repository<PedidoVenda>,
    @InjectRepository(PedidoVendaItem) private readonly itemRepo: Repository<PedidoVendaItem>,
    private readonly orcamentosService: OrcamentosService,
  ) {}

  async create(dto: CreatePedidoVendaDto) {
    const { itens = [], ...rest } = dto as any;
    const pedido = new PedidoVenda();
    Object.assign(pedido, {
      ...rest,
      dataEmissao: new Date(dto.dataEmissao),
      dataPrevisaoEntrega: dto.dataPrevisaoEntrega ? new Date(dto.dataPrevisaoEntrega) : null,
      dataEntrega: dto.dataEntrega ? new Date(dto.dataEntrega) : null,
      itens: itens.map((i: any) => {
        const item = new PedidoVendaItem();
        Object.assign(item, { ...i, totalItem: 0, companyId: dto.companyId });
        return item;
      }),
    });
    this.recalcularTotais(pedido);
    return this.repo.save(pedido);
  }

  async createFromOrcamento(dto: CreatePedidoVendaFromOrcamentoDto) {
    // Buscar orçamento completo
    const orcamento = await this.orcamentosService.findOne(dto.orcamentoId);
    
    // Validar que o status é 'concluido'
    if (orcamento.status !== StatusOrcamento.CONCLUIDO) {
      throw new BadRequestException('Apenas orçamentos concluídos podem ser convertidos em pedido de venda');
    }

    // Criar novo pedido baseado no orçamento
    const pedido = new PedidoVenda();
    Object.assign(pedido, {
      // Identificação
      numero: dto.numero || orcamento.numero,
      serie: dto.serie || orcamento.serie,
      numeroOrdemCompra: dto.numeroOrdemCompra || orcamento.numeroPedidoCotacao,
      
      // Vínculo com orçamento
      orcamentoId: orcamento.id,
      
      // Datas
      dataEmissao: dto.dataEmissao ? new Date(dto.dataEmissao) : orcamento.dataEmissao,
      dataPrevisaoEntrega: dto.dataPrevisaoEntrega ? new Date(dto.dataPrevisaoEntrega) : orcamento.dataPrevisaoEntrega,
      dataEntrega: dto.dataEntrega ? new Date(dto.dataEntrega) : null,
      
      // Relacionamentos
      clienteId: orcamento.clienteId,
      vendedorId: orcamento.vendedorId,
      transportadoraId: orcamento.transportadoraId,
      prazoPagamentoId: dto.prazoPagamentoId || orcamento.prazoPagamentoId,
      naturezaOperacaoPadraoId: dto.naturezaOperacaoPadraoId || orcamento.naturezaOperacaoPadraoId,
      formaPagamentoId: dto.formaPagamentoId || orcamento.formaPagamentoId,
      localEstoqueId: dto.localEstoqueId || orcamento.localEstoqueId,
      
      // Configurações
      parcelamento: orcamento.parcelamento,
      consumidorFinal: orcamento.consumidorFinal,
      indicadorPresenca: orcamento.indicadorPresenca,
      listaPreco: orcamento.listaPreco,
      
      // Frete e despesas
      frete: orcamento.frete,
      valorFrete: orcamento.valorFrete,
      despesas: orcamento.despesas,
      incluirFreteTotal: orcamento.incluirFreteTotal,
      
      // Dados do veículo
      placaVeiculo: orcamento.placaVeiculo,
      ufPlaca: orcamento.ufPlaca,
      rntc: orcamento.rntc,
      
      // Dados de volume e peso
      pesoLiquido: orcamento.pesoLiquido,
      pesoBruto: orcamento.pesoBruto,
      volume: orcamento.volume,
      especie: orcamento.especie,
      marca: orcamento.marca,
      numeracao: orcamento.numeracao,
      quantidadeVolumes: orcamento.quantidadeVolumes,
      
      // Observações
      observacoes: dto.observacoes || orcamento.observacoes,
      
      // Status inicial
      status: StatusPedidoVenda.RASCUNHO,
      
      // Empresa
      companyId: orcamento.companyId,
      
      // Itens (serão copiados abaixo)
      itens: [],
    });

    // Copiar itens do orçamento
    if (orcamento.itens && orcamento.itens.length > 0) {
      pedido.itens = orcamento.itens.map((itemOrcamento: any) => {
        const item = new PedidoVendaItem();
        Object.assign(item, {
          produtoId: itemOrcamento.produtoId,
          naturezaOperacaoId: itemOrcamento.naturezaOperacaoId,
          codigo: itemOrcamento.codigo,
          nome: itemOrcamento.nome,
          unidade: itemOrcamento.unidade,
          ncm: itemOrcamento.ncm,
          cest: itemOrcamento.cest,
          quantidade: itemOrcamento.quantidade,
          precoUnitario: itemOrcamento.precoUnitario,
          descontoValor: itemOrcamento.descontoValor,
          descontoPercentual: itemOrcamento.descontoPercentual,
          freteRateado: itemOrcamento.freteRateado,
          seguroRateado: itemOrcamento.seguroRateado,
          outrasDespesasRateado: itemOrcamento.outrasDespesasRateado,
          icmsBase: itemOrcamento.icmsBase,
          icmsAliquota: itemOrcamento.icmsAliquota,
          icmsValor: itemOrcamento.icmsValor,
          icmsStBase: itemOrcamento.icmsStBase,
          icmsStAliquota: itemOrcamento.icmsStAliquota,
          icmsStValor: itemOrcamento.icmsStValor,
          ipiAliquota: itemOrcamento.ipiAliquota,
          ipiValor: itemOrcamento.ipiValor,
          pisAliquota: itemOrcamento.pisAliquota,
          pisValor: itemOrcamento.pisValor,
          cofinsAliquota: itemOrcamento.cofinsAliquota,
          cofinsValor: itemOrcamento.cofinsValor,
          observacoes: itemOrcamento.observacoes,
          numeroItem: itemOrcamento.numeroItem,
          totalItem: itemOrcamento.totalItem,
          companyId: orcamento.companyId,
        });
        return item;
      });
    }

    // Recalcular totais
    this.recalcularTotais(pedido);
    
    // Salvar pedido
    return this.repo.save(pedido);
  }

  async findAll(query: { status?: StatusPedidoVenda; clienteId?: string; companyId?: string; orcamentoId?: string; inicio?: string; fim?: string }) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.clienteId) where.clienteId = query.clienteId;
    if (query.companyId) where.companyId = query.companyId;
    if (query.orcamentoId) where.orcamentoId = query.orcamentoId;
    if (query.inicio && query.fim) {
      where.dataEmissao = Between(new Date(query.inicio), new Date(query.fim));
    } else if (query.inicio) {
      where.dataEmissao = MoreThanOrEqual(new Date(query.inicio));
    } else if (query.fim) {
      where.dataEmissao = LessThanOrEqual(new Date(query.fim));
    }
    const pedidos = await this.repo.find({ 
      where, 
      relations: ['cliente', 'vendedor', 'transportadora', 'prazoPagamento', 'formaPagamento', 'localEstoque'],
      order: { createdAt: 'DESC' } 
    });
    
    // Carregar itens separadamente e criar objetos planos para garantir serialização
    const result: any[] = [];
    for (const pedido of pedidos) {
      const itens = await this.itemRepo.find({ 
        where: { pedidoVendaId: pedido.id },
        relations: ['produto', 'naturezaOperacao']
      });
      console.log(`[DEBUG] Pedido de venda ${pedido.id} tem ${itens.length} itens`);
      
      // Serializar tudo usando JSON para garantir que seja um objeto plano
      const pedidoJson: any = JSON.parse(JSON.stringify(pedido));
      const itensJson = itens.map(item => JSON.parse(JSON.stringify(item)));
      
      // Criar objeto final com itens explicitamente - usar Object.assign para garantir propriedade
      const final: any = Object.assign({}, pedidoJson);
      Object.defineProperty(final, 'itens', {
        value: itensJson,
        enumerable: true,
        writable: true,
        configurable: true
      });
      
      console.log(`[DEBUG] Final tem itens? ${!!final.itens}, quantidade: ${final.itens?.length || 0}`);
      console.log(`[DEBUG] Final tem chave itens? ${Object.prototype.hasOwnProperty.call(final, 'itens')}`);
      console.log(`[DEBUG] 'itens' in final? ${'itens' in final}`);
      console.log(`[DEBUG] final.itens === itensJson? ${final.itens === itensJson}`);
      result.push(final);
    }
    
    console.log(`[DEBUG] Retornando ${result.length} pedidos de venda`);
    if (result.length > 0) {
      console.log(`[DEBUG] Primeiro tem itens? ${!!result[0].itens}, quantidade: ${result[0].itens?.length || 0}`);
      console.log(`[DEBUG] Primeiro tem chave itens? ${Object.prototype.hasOwnProperty.call(result[0], 'itens')}`);
      console.log(`[DEBUG] Todas as chaves do primeiro: ${Object.keys(result[0]).join(', ')}`);
    }
    return result;
  }

  async findOne(id: string) {
    const found = await this.repo.findOne({ where: { id }, relations: ['itens'] });
    if (!found) throw new NotFoundException('Pedido de venda não encontrado');
    return found;
  }

  async update(id: string, dto: UpdatePedidoVendaDto) {
    const existing = await this.findOne(id);
    const { itens, ...rest } = dto as any;
    // Não permitir troca de empresa por segurança
    if (dto.companyId && dto.companyId !== existing.companyId) {
      throw new BadRequestException('companyId não pode ser alterado');
    }
    Object.assign(existing, {
      ...rest,
      dataEmissao: dto.dataEmissao ? new Date(dto.dataEmissao) : existing.dataEmissao,
      dataPrevisaoEntrega: dto.dataPrevisaoEntrega ? new Date(dto.dataPrevisaoEntrega) : existing.dataPrevisaoEntrega,
      dataEntrega: dto.dataEntrega ? new Date(dto.dataEntrega) : existing.dataEntrega,
    });

    if (itens) {
      await this.itemRepo.delete({ pedidoVendaId: id });
      existing.itens = itens.map((i: any) => {
        const item = new PedidoVendaItem();
        Object.assign(item, { ...i, pedidoVendaId: id, companyId: existing.companyId });
        return item;
      });
    }

    this.recalcularTotais(existing);
    return this.repo.save(existing);
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.repo.remove(existing);
    return { ok: true };
  }

  // Stubs de cálculo fiscal (integração futura)
  async recalcularImpostos(id: string) {
    const pedido = await this.findOne(id);
    // TODO: integrar com módulo de impostos
    this.recalcularTotais(pedido);
    return this.repo.save(pedido);
  }

  private recalcularTotais(pedido: PedidoVenda) {
    const itens = pedido.itens || [];
    itens.forEach((i) => {
      const bruto = Number(i.precoUnitario) * Number(i.quantidade);
      const desc = Number(i.descontoValor || 0) + (bruto * Number(i.descontoPercentual || 0)) / 100;
      const rateios = Number(i.freteRateado || 0) + Number(i.seguroRateado || 0) + Number(i.outrasDespesasRateado || 0);
      const trib = Number(i.icmsValor || 0) + Number(i.ipiValor || 0) + Number(i.pisValor || 0) + Number(i.cofinsValor || 0) + Number(i.icmsStValor || 0);
      i.totalItem = Number((bruto - desc + rateios + trib).toFixed(2));
    });
    pedido.totalProdutos = Number(itens.reduce((s, i) => s + Number(i.precoUnitario) * Number(i.quantidade), 0).toFixed(2));
    pedido.totalDescontos = Number(itens.reduce((s, i) => s + Number(i.descontoValor || 0), 0).toFixed(2));
    pedido.totalImpostos = Number(itens.reduce((s, i) =>
      s + Number(i.icmsValor || 0) + Number(i.ipiValor || 0) + Number(i.pisValor || 0) + Number(i.cofinsValor || 0) + Number(i.icmsStValor || 0), 0).toFixed(2));
    
    // Calcular total geral baseado nos itens
    let totalGeral = Number(itens.reduce((s, i) => s + Number(i.totalItem || 0), 0).toFixed(2));
    
    // Despesas sempre são incluídas no total
    totalGeral += Number(pedido.despesas || 0);
    
    // Frete só é incluído se incluirFreteTotal estiver marcado
    if (pedido.incluirFreteTotal) {
      totalGeral += Number(pedido.valorFrete || 0);
    }
    
    pedido.totalGeral = Number(totalGeral.toFixed(2));
  }
}
