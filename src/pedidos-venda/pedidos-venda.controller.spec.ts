import { Test, TestingModule } from '@nestjs/testing';
import { PedidosVendaController } from './pedidos-venda.controller';
import { PedidosVendaService } from './pedidos-venda.service';
import { CreatePedidoVendaDto } from './dto/create-pedido-venda.dto';
import { UpdatePedidoVendaDto } from './dto/update-pedido-venda.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { StatusPedido } from '../shared/enums/pedido-venda.enums';

describe('PedidosVendaController', () => {
  let controller: PedidosVendaController;
  let service: jest.Mocked<PedidosVendaService>;

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

  const mockRequest = {
    user: {
      companyId: mockCompanyId,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PedidosVendaController],
      providers: [
        {
          provide: PedidosVendaService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updateStatus: jest.fn(),
            clonar: jest.fn(),
            cancelar: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PedidosVendaController>(PedidosVendaController);
    service = module.get(PedidosVendaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new pedido venda', async () => {
      const createDto: CreatePedidoVendaDto = {
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

      service.create.mockResolvedValue(mockPedidoVenda as any);

      const result = await controller.create(createDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockCompanyId);
      expect(result).toEqual(mockPedidoVenda);
    });
  });

  describe('findAll', () => {
    it('should return paginated pedidos', async () => {
      const mockResponse = {
        data: [mockPedidoVenda],
        total: 1,
      };

      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockRequest, '1', '10');

      expect(service.findAll).toHaveBeenCalledWith(mockCompanyId, 1, 10);
      expect(result).toEqual(mockResponse);
    });

    it('should use default pagination when no params provided', async () => {
      const mockResponse = {
        data: [mockPedidoVenda],
        total: 1,
      };

      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockCompanyId, 1, 10);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a specific pedido', async () => {
      service.findOne.mockResolvedValue(mockPedidoVenda as any);

      const result = await controller.findOne(mockPedidoId);

      expect(service.findOne).toHaveBeenCalledWith(mockPedidoId);
      expect(result).toEqual(mockPedidoVenda);
    });
  });

  describe('update', () => {
    it('should update a pedido', async () => {
      const updateDto: UpdatePedidoVendaDto = {
        observacoes: 'Observações atualizadas',
      };

      service.update.mockResolvedValue({
        ...mockPedidoVenda,
        ...updateDto,
      } as any);

      const result = await controller.update(
        mockPedidoId,
        updateDto,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledWith(
        mockPedidoId,
        updateDto,
        mockCompanyId,
      );
      expect(result).toBeDefined();
    });
  });

  describe('updateStatus', () => {
    it('should update pedido status', async () => {
      const updateStatusDto: UpdateStatusPedidoDto = {
        status: StatusPedido.APROVADO,
      };

      service.updateStatus.mockResolvedValue({
        ...mockPedidoVenda,
        status: StatusPedido.APROVADO,
      } as any);

      const result = await controller.updateStatus(
        mockPedidoId,
        updateStatusDto,
        mockRequest,
      );

      expect(service.updateStatus).toHaveBeenCalledWith(
        mockPedidoId,
        updateStatusDto,
        mockCompanyId,
      );
      expect(result).toBeDefined();
    });
  });

  describe('clonar', () => {
    it('should clone a pedido', async () => {
      const pedidoClonado = {
        ...mockPedidoVenda,
        id: 'new-pedido-id',
        numeroPedido: 'PED001-COPIA',
        status: StatusPedido.PENDENTE,
      };

      service.clonar.mockResolvedValue(pedidoClonado as any);

      const result = await controller.clonar(mockPedidoId, mockRequest);

      expect(service.clonar).toHaveBeenCalledWith(mockPedidoId, mockCompanyId);
      expect(result).toEqual(pedidoClonado);
    });
  });

  describe('cancelar', () => {
    it('should cancel a pedido', async () => {
      const pedidoCancelado = {
        ...mockPedidoVenda,
        status: StatusPedido.CANCELADO,
      };

      service.cancelar.mockResolvedValue(pedidoCancelado as any);

      const result = await controller.cancelar(mockPedidoId, mockRequest);

      expect(service.cancelar).toHaveBeenCalledWith(
        mockPedidoId,
        mockCompanyId,
      );
      expect(result).toEqual(pedidoCancelado);
    });
  });

  describe('remove', () => {
    it('should delete a pedido', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockPedidoId, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(mockPedidoId, mockCompanyId);
      expect(result).toBeUndefined();
    });
  });
});
