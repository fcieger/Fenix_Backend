import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PedidoVenda } from './entities/pedido-venda.entity';
import { PedidoVendaItem } from './entities/pedido-venda-item.entity';
import { CreatePedidoVendaDto } from './dto/create-pedido-venda.dto';
import { UpdatePedidoVendaDto } from './dto/update-pedido-venda.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { StatusPedido } from '../shared/enums/pedido-venda.enums';

@Injectable()
export class PedidosVendaService {
  constructor(
    @InjectRepository(PedidoVenda)
    private pedidoVendaRepository: Repository<PedidoVenda>,
    @InjectRepository(PedidoVendaItem)
    private pedidoVendaItemRepository: Repository<PedidoVendaItem>,
  ) {}

  async create(createPedidoDto: CreatePedidoVendaDto, companyId: string): Promise<PedidoVenda> {
    // Calcular totais automaticamente
    const totais = this.calcularTotais(createPedidoDto.itens);
    
    const { itens: itensDto, ...pedidoData } = createPedidoDto;
    
    const pedido = this.pedidoVendaRepository.create({
      ...pedidoData,
      companyId,
      totalDescontos: totais.totalDescontos,
      totalImpostos: totais.totalImpostos,
      totalProdutos: totais.totalProdutos,
      totalPedido: totais.totalPedido,
      dataEmissao: new Date(createPedidoDto.dataEmissao),
      dataPrevisao: createPedidoDto.dataPrevisao ? new Date(createPedidoDto.dataPrevisao) : null,
      dataEntrega: createPedidoDto.dataEntrega ? new Date(createPedidoDto.dataEntrega) : null,
    } as any);

    // Forçar a assinatura correta do overload de save para evitar inferência como array
    const pedidoSalvo = await this.pedidoVendaRepository.save(pedido as any) as PedidoVenda;

    // Criar itens do pedido
    const itens = itensDto.map(itemDto => 
      this.pedidoVendaItemRepository.create({
        ...itemDto,
        pedidoVendaId: pedidoSalvo.id,
        companyId,
      })
    );

    await this.pedidoVendaItemRepository.save(itens);

    // Retornar pedido com itens
    return this.findOne(pedidoSalvo.id);
  }

  async findAll(companyId: string, page: number = 1, limit: number = 10): Promise<{ data: PedidoVenda[], total: number }> {
    const [pedidos, total] = await this.pedidoVendaRepository.findAndCount({
      where: { companyId },
      relations: ['cliente', 'vendedor', 'naturezaOperacao', 'prazoPagamento', 'itens', 'itens.produto', 'itens.naturezaOperacao'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: pedidos, total };
  }

  async findOne(id: string): Promise<PedidoVenda> {
    const pedido = await this.pedidoVendaRepository.findOne({
      where: { id },
      relations: ['cliente', 'vendedor', 'naturezaOperacao', 'prazoPagamento', 'itens', 'itens.produto', 'itens.naturezaOperacao'],
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return pedido;
  }

  async update(id: string, updatePedidoDto: UpdatePedidoVendaDto, companyId: string): Promise<PedidoVenda> {
    const pedido = await this.findOne(id);

    if (pedido.companyId !== companyId) {
      throw new BadRequestException('Acesso negado');
    }

    // Se houver itens na atualização, recalcular totais
    if (updatePedidoDto.itens) {
      const totais = this.calcularTotais(updatePedidoDto.itens);
      updatePedidoDto.totalDescontos = totais.totalDescontos;
      updatePedidoDto.totalImpostos = totais.totalImpostos;
      updatePedidoDto.totalProdutos = totais.totalProdutos;
      updatePedidoDto.totalPedido = totais.totalPedido;

      // Atualizar itens
      await this.pedidoVendaItemRepository.delete({ pedidoVendaId: id });
      
      const itens = updatePedidoDto.itens.map(itemDto => 
        this.pedidoVendaItemRepository.create({
          ...itemDto,
          pedidoVendaId: id,
          companyId,
        })
      );

      await this.pedidoVendaItemRepository.save(itens);
    }

    // Converter datas se fornecidas
    if (updatePedidoDto.dataEmissao) {
      updatePedidoDto.dataEmissao = new Date(updatePedidoDto.dataEmissao).toISOString();
    }
    if (updatePedidoDto.dataPrevisao) {
      updatePedidoDto.dataPrevisao = new Date(updatePedidoDto.dataPrevisao).toISOString();
    }
    if (updatePedidoDto.dataEntrega) {
      updatePedidoDto.dataEntrega = new Date(updatePedidoDto.dataEntrega).toISOString();
    }

    await this.pedidoVendaRepository.update(id, updatePedidoDto);
    return this.findOne(id);
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusPedidoDto, companyId: string): Promise<PedidoVenda> {
    const pedido = await this.findOne(id);

    if (pedido.companyId !== companyId) {
      throw new BadRequestException('Acesso negado');
    }

    // Validar transição de status
    if (!this.isValidTransition(pedido.status, updateStatusDto.status)) {
      throw new BadRequestException('Transição de status inválida');
    }

    await this.pedidoVendaRepository.update(id, { 
      status: updateStatusDto.status,
      updatedAt: new Date()
    });

    return this.findOne(id);
  }

  async clonar(id: string, companyId: string): Promise<PedidoVenda> {
    const pedidoOriginal = await this.findOne(id);

    if (pedidoOriginal.companyId !== companyId) {
      throw new BadRequestException('Acesso negado');
    }

    // Criar novo pedido baseado no original
    // Evitar espalhar propriedades não permitidas (id, datas gerenciadas) para não confundir os overloads
    const { id: _omitId, createdAt: _omitCreated, updatedAt: _omitUpdated, ...base } = (pedidoOriginal as any);
    const novoPedido = this.pedidoVendaRepository.create({
      ...(base as any),
      numeroPedido: `${pedidoOriginal.numeroPedido}-COPIA`,
      status: StatusPedido.PENDENTE,
      dataEmissao: new Date(),
      dataPrevisao: null,
      dataEntrega: null,
      numeroNFe: null,
    } as any);

    const pedidoSalvo = await this.pedidoVendaRepository.save(novoPedido as any) as PedidoVenda;

    // Clonar itens
    const itensClonados = pedidoOriginal.itens.map(item => 
      this.pedidoVendaItemRepository.create({
        ...item,
        id: undefined,
        pedidoVendaId: pedidoSalvo.id,
        createdAt: undefined,
        updatedAt: undefined,
      })
    );

    await this.pedidoVendaItemRepository.save(itensClonados);

    return this.findOne(pedidoSalvo.id);
  }

  async cancelar(id: string, companyId: string): Promise<PedidoVenda> {
    return this.updateStatus(id, { status: StatusPedido.CANCELADO }, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const pedido = await this.findOne(id);

    if (pedido.companyId !== companyId) {
      throw new BadRequestException('Acesso negado');
    }

    // Verificar se pode ser excluído (apenas pedidos pendentes)
    if (pedido.status !== StatusPedido.PENDENTE) {
      throw new BadRequestException('Apenas pedidos pendentes podem ser excluídos');
    }

    await this.pedidoVendaRepository.delete(id);
  }

  private calcularTotais(itens: any[]): { totalDescontos: number, totalImpostos: number, totalProdutos: number, totalPedido: number } {
    const totalDescontos = itens.reduce((sum, item) => sum + (item.valorDesconto || 0), 0);
    const totalImpostos = 0; // TODO: Implementar cálculo de impostos
    const totalProdutos = itens.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const totalPedido = totalProdutos + totalImpostos;

    return {
      totalDescontos,
      totalImpostos,
      totalProdutos,
      totalPedido
    };
  }

  private isValidTransition(currentStatus: StatusPedido, newStatus: StatusPedido): boolean {
    const validTransitions: Record<StatusPedido, StatusPedido[]> = {
      [StatusPedido.PENDENTE]: [StatusPedido.APROVADO, StatusPedido.CANCELADO],
      [StatusPedido.APROVADO]: [StatusPedido.EM_PREPARACAO, StatusPedido.CANCELADO],
      [StatusPedido.EM_PREPARACAO]: [StatusPedido.ENVIADO, StatusPedido.CANCELADO],
      [StatusPedido.ENVIADO]: [StatusPedido.ENTREGUE, StatusPedido.DEVOLVIDO],
      [StatusPedido.ENTREGUE]: [StatusPedido.FATURADO, StatusPedido.DEVOLVIDO],
      [StatusPedido.FATURADO]: [StatusPedido.DEVOLVIDO],
      [StatusPedido.CANCELADO]: [], // Status final
      [StatusPedido.DEVOLVIDO]: [] // Status final
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
