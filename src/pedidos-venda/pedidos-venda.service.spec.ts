import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PedidosVendaService } from './pedidos-venda.service';
import { PedidoVenda } from './entities/pedido-venda.entity';
import { PedidoVendaItem } from './entities/pedido-venda-item.entity';
import { CreatePedidoVendaDto } from './dto/create-pedido-venda.dto';
import { UpdatePedidoVendaDto } from './dto/update-pedido-venda.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { StatusPedido } from '../shared/enums/pedido-venda.enums';

describe('PedidosVendaService', () => {
  let service: PedidosVendaService;
  let pedidoVendaRepository: jest.Mocked<Repository<PedidoVenda>>;
  let pedidoVendaItemRepository: jest.Mocked<Repository<PedidoVendaItem>>;

  const mockCompanyId = 'company-1';
  const mockPedidoId = 'pedido-1';

  const mockPedidoVenda = {
    id: mockPedidoId,
    companyId: mockCompanyId,
    numeroPedido: 'PED001',
    status: StatusPedido.PENDENTE,
    clienteId: 'cliente-1',
    vendedorId: 'vendedor-1',
    naturezaOperacaoId: 'natureza-1',
    prazoPagamentoId: 'prazo-1',
    totalProdutos: 200,
    totalDescontos: 0,
    totalImpostos: 0,
    totalPedido: 200,
    dataEmissao: new Date(),
    itens: [],
  };

  const mockCreatePedidoDto: CreatePedidoVendaDto = {
    numeroPedido: 'PED001',
    clienteId: 'cliente-1',
    vendedorId: 'vendedor-1',
    naturezaOperacaoId: 'natureza-1',
    prazoPagamentoId: 'prazo-1',
    dataEmissao: new Date().toISOString(),
    observacoes: 'Pedido de teste',
    itens: [
      {
        produtoId: 'produto-1',
        quantidade: 2,
        valorUnitario: 100,
        valorTotal: 200,
        valorDesconto: 0,
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidosVendaService,
        {
          provide: getRepositoryToken(PedidoVenda),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PedidoVendaItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PedidosVendaService>(PedidosVendaService);
    pedidoVendaRepository = module.get(getRepositoryToken(PedidoVenda));
    pedidoVendaItemRepository = module.get(getRepositoryToken(PedidoVendaItem));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new pedido venda', async () => {
      pedidoVendaRepository.create.mockReturnValue(mockPedidoVenda as any);
      pedidoVendaRepository.save.mockResolvedValue(mockPedidoVenda as any);
      pedidoVendaItemRepository.create.mockReturnValue({} as any);
      pedidoVendaItemRepository.save.mockResolvedValue([]);
      pedidoVendaRepository.findOne.mockResolvedValue(mockPedidoVenda as any);

      const result = await service.create(mockCreatePedidoDto, mockCompanyId);

      expect(pedidoVendaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: mockCompanyId,
          totalProdutos: 200,
          totalPedido: 200,
        }),
      );
      expect(pedidoVendaRepository.save).toHaveBeenCalled();
      expect(pedidoVendaItemRepository.create).toHaveBeenCalled();
      expect(pedidoVendaItemRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return paginated pedidos', async () => {
      const mockPedidos = [mockPedidoVenda];
      pedidoVendaRepository.findAndCount.mockResolvedValue([mockPedidos, 1]);

      const result = await service.findAll(mockCompanyId, 1, 10);

      expect(pedidoVendaRepository.findAndCount).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        relations: expect.arrayContaining([
          'cliente',
          'vendedor',
          'naturezaOperacao',
          'prazoPagamento',
          'itens',
          'itens.produto',
          'itens.naturezaOperacao',
        ]),
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({ data: mockPedidos, total: 1 });
    });
  });

  describe('findOne', () => {
    it('should return a specific pedido', async () => {
      pedidoVendaRepository.findOne.mockResolvedValue(mockPedidoVenda as any);

      const result = await service.findOne(mockPedidoId);

      expect(pedidoVendaRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPedidoId },
        relations: expect.arrayContaining([
          'cliente',
          'vendedor',
          'naturezaOperacao',
          'prazoPagamento',
          'itens',
          'itens.produto',
          'itens.naturezaOperacao',
        ]),
      });
      expect(result).toEqual(mockPedidoVenda);
    });

    it('should throw NotFoundException when pedido is not found', async () => {
      pedidoVendaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockPedidoId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a pedido', async () => {
      const updateDto: UpdatePedidoVendaDto = {
        observacoes: 'Observações atualizadas',
      };

      pedidoVendaRepository.findOne.mockResolvedValue(mockPedidoVenda as any);
      pedidoVendaRepository.update.mockResolvedValue({ affected: 1 } as any);
      pedidoVendaRepository.findOne
        .mockResolvedValueOnce(mockPedidoVenda as any)
        .mockResolvedValueOnce({ ...mockPedidoVenda, ...updateDto } as any);

      const result = await service.update(
        mockPedidoId,
        updateDto,
        mockCompanyId,
      );

      expect(pedidoVendaRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPedidoId },
        relations: expect.any(Array),
      });
      expect(pedidoVendaRepository.update).toHaveBeenCalledWith(
        mockPedidoId,
        updateDto,
      );
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when accessing other company pedido', async () => {
      const otherCompanyPedido = {
        ...mockPedidoVenda,
        companyId: 'other-company',
      };
      const updateDto: UpdatePedidoVendaDto = {
        observacoes: 'Observações atualizadas',
      };

      pedidoVendaRepository.findOne.mockResolvedValue(
        otherCompanyPedido as any,
      );

      await expect(
        service.update(mockPedidoId, updateDto, mockCompanyId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should recalculate totals when items are updated', async () => {
      const updateDto: UpdatePedidoVendaDto = {
        itens: [
          {
            produtoId: 'produto-2',
            quantidade: 1,
            valorUnitario: 150,
            valorTotal: 150,
            valorDesconto: 10,
          },
        ],
      };

      pedidoVendaRepository.findOne.mockResolvedValue(mockPedidoVenda as any);
      pedidoVendaItemRepository.delete.mockResolvedValue({
        affected: 1,
      } as any);
      pedidoVendaItemRepository.create.mockReturnValue({} as any);
      pedidoVendaItemRepository.save.mockResolvedValue([]);
      pedidoVendaRepository.update.mockResolvedValue({ affected: 1 } as any);
      pedidoVendaRepository.findOne
        .mockResolvedValueOnce(mockPedidoVenda as any)
        .mockResolvedValueOnce({ ...mockPedidoVenda, ...updateDto } as any);

      const result = await service.update(
        mockPedidoId,
        updateDto,
        mockCompanyId,
      );

      expect(pedidoVendaItemRepository.delete).toHaveBeenCalledWith({
        pedidoVendaId: mockPedidoId,
      });
      expect(pedidoVendaItemRepository.create).toHaveBeenCalled();
      expect(pedidoVendaItemRepository.save).toHaveBeenCalled();
      expect(pedidoVendaRepository.update).toHaveBeenCalledWith(
        mockPedidoId,
        expect.objectContaining({
          totalProdutos: 150,
          totalDescontos: 10,
          totalPedido: 150,
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('updateStatus', () => {
    it('should update pedido status', async () => {
      const updateStatusDto: UpdateStatusPedidoDto = {
        status: StatusPedido.APROVADO,
      };

      pedidoVendaRepository.findOne.mockResolvedValue(mockPedidoVenda as any);
      pedidoVendaRepository.update.mockResolvedValue({ affected: 1 } as any);
      pedidoVendaRepository.findOne
        .mockResolvedValueOnce(mockPedidoVenda as any)
        .mockResolvedValueOnce({
          ...mockPedidoVenda,
          status: StatusPedido.APROVADO,
        } as any);

      const result = await service.updateStatus(
        mockPedidoId,
        updateStatusDto,
        mockCompanyId,
      );

      expect(pedidoVendaRepository.update).toHaveBeenCalledWith(
        mockPedidoId,
        expect.objectContaining({
          status: StatusPedido.APROVADO,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const pedidoFaturado = {
        ...mockPedidoVenda,
        status: StatusPedido.FATURADO,
      };
      const updateStatusDto: UpdateStatusPedidoDto = {
        status: StatusPedido.PENDENTE,
      };

      pedidoVendaRepository.findOne.mockResolvedValue(pedidoFaturado as any);

      await expect(
        service.updateStatus(mockPedidoId, updateStatusDto, mockCompanyId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('clonar', () => {
    it('should clone a pedido', async () => {
      const pedidoComItens = {
        ...mockPedidoVenda,
        itens: [
          {
            id: 'item-1',
            produtoId: 'produto-1',
            quantidade: 2,
            valorUnitario: 100,
            valorTotal: 200,
          },
        ],
      };

      pedidoVendaRepository.findOne.mockResolvedValue(pedidoComItens as any);
      pedidoVendaRepository.create.mockReturnValue({
        ...mockPedidoVenda,
        id: 'new-pedido-id',
      } as any);
      pedidoVendaRepository.save.mockResolvedValue({
        ...mockPedidoVenda,
        id: 'new-pedido-id',
      } as any);
      pedidoVendaItemRepository.create.mockReturnValue({} as any);
      pedidoVendaItemRepository.save.mockResolvedValue([]);
      pedidoVendaRepository.findOne
        .mockResolvedValueOnce(pedidoComItens as any)
        .mockResolvedValueOnce({
          ...mockPedidoVenda,
          id: 'new-pedido-id',
        } as any);

      const result = await service.clonar(mockPedidoId, mockCompanyId);

      expect(pedidoVendaRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          numeroPedido: 'PED001-COPIA',
          status: StatusPedido.PENDENTE,
        }),
      );
      expect(pedidoVendaItemRepository.create).toHaveBeenCalled();
      expect(pedidoVendaItemRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('cancelar', () => {
    it('should cancel a pedido', async () => {
      pedidoVendaRepository.findOne.mockResolvedValue(mockPedidoVenda as any);
      pedidoVendaRepository.update.mockResolvedValue({ affected: 1 } as any);
      pedidoVendaRepository.findOne
        .mockResolvedValueOnce(mockPedidoVenda as any)
        .mockResolvedValueOnce({
          ...mockPedidoVenda,
          status: StatusPedido.CANCELADO,
        } as any);

      const result = await service.cancelar(mockPedidoId, mockCompanyId);

      expect(pedidoVendaRepository.update).toHaveBeenCalledWith(
        mockPedidoId,
        expect.objectContaining({
          status: StatusPedido.CANCELADO,
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a pending pedido', async () => {
      pedidoVendaRepository.findOne.mockResolvedValue(mockPedidoVenda as any);
      pedidoVendaRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockPedidoId, mockCompanyId);

      expect(pedidoVendaRepository.delete).toHaveBeenCalledWith(mockPedidoId);
    });

    it('should throw BadRequestException when trying to delete non-pending pedido', async () => {
      const pedidoAprovado = {
        ...mockPedidoVenda,
        status: StatusPedido.APROVADO,
      };
      pedidoVendaRepository.findOne.mockResolvedValue(pedidoAprovado as any);

      await expect(service.remove(mockPedidoId, mockCompanyId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('calcularTotais', () => {
    it('should calculate totals correctly', () => {
      const itens = [
        { valorTotal: 100, valorDesconto: 10 },
        { valorTotal: 200, valorDesconto: 20 },
      ];

      // Acessar método privado através de any
      const totais = (service as any).calcularTotais(itens);

      expect(totais.totalProdutos).toBe(300);
      expect(totais.totalDescontos).toBe(30);
      expect(totais.totalImpostos).toBe(0);
      expect(totais.totalPedido).toBe(300);
    });
  });

  describe('isValidTransition', () => {
    it('should validate status transitions correctly', () => {
      // Acessar método privado através de any
      const isValidTransition = (service as any).isValidTransition;

      expect(
        isValidTransition(StatusPedido.PENDENTE, StatusPedido.APROVADO),
      ).toBe(true);
      expect(
        isValidTransition(StatusPedido.PENDENTE, StatusPedido.CANCELADO),
      ).toBe(true);
      expect(
        isValidTransition(StatusPedido.PENDENTE, StatusPedido.EM_PREPARACAO),
      ).toBe(false);
      expect(
        isValidTransition(StatusPedido.FATURADO, StatusPedido.PENDENTE),
      ).toBe(false);
    });
  });
});
