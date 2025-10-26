import { Test, TestingModule } from '@nestjs/testing';
import { ImpostosController } from './impostos.controller';
import { CalculadoraImpostosService } from './impostos.service';
import { CalcularImpostosPedidoDto } from './dto/calcular-impostos.dto';

describe('ImpostosController', () => {
  let controller: ImpostosController;
  let service: jest.Mocked<CalculadoraImpostosService>;

  const mockResponse = {
    itens: [
      {
        produtoId: '1',
        nome: 'Produto Teste',
        quantidade: 2,
        valorUnitario: 100,
        subtotal: 200,
        desconto: 0,
        baseCalculo: 200,
        pis: {
          base: 200,
          aliquota: 1.65,
          valor: 3.3,
          cst: '01',
        },
        cofins: {
          base: 200,
          aliquota: 7.6,
          valor: 15.2,
          cst: '01',
        },
        ipi: {
          base: 200,
          aliquota: 5,
          valor: 10,
          cst: '00',
        },
        icms: {
          base: 200,
          aliquota: 18,
          valor: 36,
          cst: '00',
        },
        totalImpostos: 64.5,
      },
    ],
    totais: {
      totalProdutos: 200,
      totalDescontos: 0,
      totalImpostos: 64.5,
      totalPedido: 264.5,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImpostosController],
      providers: [
        {
          provide: CalculadoraImpostosService,
          useValue: {
            calcularPedido: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ImpostosController>(ImpostosController);
    service = module.get(CalculadoraImpostosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calcular', () => {
    it('should calculate taxes for order', async () => {
      const dto: CalcularImpostosPedidoDto = {
        companyId: '1',
        clienteId: '1',
        naturezaOperacaoId: '1',
        ufOrigem: 'SP',
        ufDestino: 'RJ',
        incluirFreteTotal: false,
        valorFrete: 0,
        despesas: 0,
        itens: [
          {
            produtoId: '1',
            nome: 'Produto Teste',
            quantidade: 2,
            valorUnitario: 100,
            valorDesconto: 0,
          },
        ],
      };

      service.calcularPedido.mockResolvedValue(mockResponse);

      const result = await controller.calcular(dto);

      expect(service.calcularPedido).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });

    it('should handle any body format for flexibility', async () => {
      const flexibleDto = {
        companyId: '1',
        naturezaOperacaoId: '1',
        itens: [
          {
            nome: 'Produto Teste',
            quantidade: 1,
            valorUnitario: 100,
          },
        ],
      };

      service.calcularPedido.mockResolvedValue(mockResponse);

      const result = await controller.calcular(flexibleDto);

      expect(service.calcularPedido).toHaveBeenCalledWith(flexibleDto);
      expect(result).toEqual(mockResponse);
    });
  });
});
