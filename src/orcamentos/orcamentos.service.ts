import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThanOrEqual, LessThanOrEqual, Repository } from 'typeorm';
import { Orcamento, StatusOrcamento } from './entities/orcamento.entity';
import { OrcamentoItem } from './entities/orcamento-item.entity';
import { CreateOrcamentoDto } from './dto/create-orcamento.dto';
import { UpdateOrcamentoDto } from './dto/update-orcamento.dto';

@Injectable()
export class OrcamentosService {
  constructor(
    @InjectRepository(Orcamento) private readonly repo: Repository<Orcamento>,
    @InjectRepository(OrcamentoItem) private readonly itemRepo: Repository<OrcamentoItem>,
  ) {}

  async create(dto: CreateOrcamentoDto) {
    try {
      console.log('[OrcamentosService] Criando orçamento:', JSON.stringify(dto, null, 2));
      const { itens = [], ...rest } = dto as any;
      const orc = new Orcamento();
      Object.assign(orc, {
        ...rest,
        dataEmissao: new Date(dto.dataEmissao),
        dataPrevisaoEntrega: dto.dataPrevisaoEntrega ? new Date(dto.dataPrevisaoEntrega) : null,
        itens: itens.map((i: any) => {
          const item = new OrcamentoItem();
          Object.assign(item, { ...i, totalItem: 0, companyId: dto.companyId });
          return item;
        }),
      });
      this.recalcularTotais(orc);
      console.log('[OrcamentosService] Orçamento preparado, salvando...');
      const saved = await this.repo.save(orc);
      console.log('[OrcamentosService] Orçamento salvo com sucesso:', saved.id);
      return saved;
    } catch (error: any) {
      console.error('[OrcamentosService] Erro ao criar orçamento:', error);
      console.error('[OrcamentosService] Stack:', error.stack);
      console.error('[OrcamentosService] Message:', error.message);
      throw error;
    }
  }

  async findAll(query: { status?: StatusOrcamento; clienteId?: string; companyId?: string; inicio?: string; fim?: string }) {
    try {
      console.log('[OrcamentosService] findAll iniciado com query:', JSON.stringify(query, null, 2));
      const where: any = {};
      if (query.status) where.status = query.status;
      if (query.clienteId) where.clienteId = query.clienteId;
      if (query.companyId) where.companyId = query.companyId;
      if (query.inicio && query.fim) {
        where.dataEmissao = Between(new Date(query.inicio), new Date(query.fim));
      } else if (query.inicio) {
        where.dataEmissao = MoreThanOrEqual(new Date(query.inicio));
      } else if (query.fim) {
        where.dataEmissao = LessThanOrEqual(new Date(query.fim));
      }
      console.log('[OrcamentosService] Buscando orçamentos com where:', JSON.stringify(where, null, 2));
      const orcamentos = await this.repo.find({ 
        where, 
        relations: ['cliente', 'vendedor', 'transportadora', 'prazoPagamento', 'formaPagamento', 'localEstoque'],
        order: { createdAt: 'DESC' } 
      });
      console.log(`[OrcamentosService] Encontrados ${orcamentos.length} orçamentos`);
    
    // Carregar itens separadamente e criar objetos planos para garantir serialização
    const result: any[] = [];
    for (const orc of orcamentos) {
      const itens = await this.itemRepo.find({ 
        where: { orcamentoId: orc.id },
        relations: ['produto', 'naturezaOperacao']
      });
      console.log(`[DEBUG] Orçamento ${orc.id} tem ${itens.length} itens`);
      
      // Serializar tudo usando JSON para garantir que seja um objeto plano
      const orcJson: any = JSON.parse(JSON.stringify(orc));
      const itensJson = itens.map(item => JSON.parse(JSON.stringify(item)));
      
      // Criar objeto final com itens explicitamente - usar Object.assign para garantir propriedade
      const final: any = Object.assign({}, orcJson);
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
    
    console.log(`[DEBUG] Retornando ${result.length} orçamentos`);
    if (result.length > 0) {
      console.log(`[DEBUG] Primeiro tem itens? ${!!result[0].itens}, quantidade: ${result[0].itens?.length || 0}`);
      console.log(`[DEBUG] Primeiro tem chave itens? ${Object.prototype.hasOwnProperty.call(result[0], 'itens')}`);
      console.log(`[DEBUG] Todas as chaves do primeiro: ${Object.keys(result[0]).join(', ')}`);
    }
    console.log('[OrcamentosService] findAll concluído com sucesso');
    return result;
    } catch (error: any) {
      console.error('[OrcamentosService] Erro em findAll:', error);
      console.error('[OrcamentosService] Stack:', error.stack);
      console.error('[OrcamentosService] Message:', error.message);
      throw error;
    }
  }

  async findOne(id: string) {
    const found = await this.repo.findOne({ where: { id }, relations: ['itens'] });
    if (!found) throw new NotFoundException('Orçamento não encontrado');
    return found;
  }

  async update(id: string, dto: UpdateOrcamentoDto) {
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
    });

    if (itens) {
      await this.itemRepo.delete({ orcamentoId: id });
      existing.itens = itens.map((i: any) => {
        const item = new OrcamentoItem();
        Object.assign(item, { ...i, orcamentoId: id, companyId: existing.companyId });
        return item;
      });
    }

    this.recalcularTotais(existing);
    return this.repo.save(existing);
  }

  async changeStatus(id: string, status: StatusOrcamento) {
    const existing = await this.findOne(id);
    existing.status = status;
    return this.repo.save(existing);
  }

  async remove(id: string) {
    const existing = await this.findOne(id);
    await this.repo.remove(existing);
    return { ok: true };
  }

  // Stubs de cálculo fiscal (integração futura)
  async recalcularImpostos(id: string) {
    const orc = await this.findOne(id);
    // TODO: integrar com módulo de impostos
    this.recalcularTotais(orc);
    return this.repo.save(orc);
  }

  private recalcularTotais(orc: Orcamento) {
    const itens = orc.itens || [];
    itens.forEach((i) => {
      const bruto = Number(i.precoUnitario) * Number(i.quantidade);
      const desc = Number(i.descontoValor || 0) + (bruto * Number(i.descontoPercentual || 0)) / 100;
      const rateios = Number(i.freteRateado || 0) + Number(i.seguroRateado || 0) + Number(i.outrasDespesasRateado || 0);
      const trib = Number(i.icmsValor || 0) + Number(i.ipiValor || 0) + Number(i.pisValor || 0) + Number(i.cofinsValor || 0) + Number(i.icmsStValor || 0);
      i.totalItem = Number((bruto - desc + rateios + trib).toFixed(2));
    });
    orc.totalProdutos = Number(itens.reduce((s, i) => s + Number(i.precoUnitario) * Number(i.quantidade), 0).toFixed(2));
    orc.totalDescontos = Number(itens.reduce((s, i) => s + Number(i.descontoValor || 0), 0).toFixed(2));
    orc.totalImpostos = Number(itens.reduce((s, i) =>
      s + Number(i.icmsValor || 0) + Number(i.ipiValor || 0) + Number(i.pisValor || 0) + Number(i.cofinsValor || 0) + Number(i.icmsStValor || 0), 0).toFixed(2));
    orc.totalGeral = Number(itens.reduce((s, i) => s + Number(i.totalItem || 0), 0).toFixed(2));
  }
}


