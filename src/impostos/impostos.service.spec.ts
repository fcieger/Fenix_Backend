import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CalculadoraImpostosService } from './impostos.service';
import { NaturezaOperacao } from '../natureza-operacao/entities/natureza-operacao.entity';
import { ConfiguracaoImpostoEstado } from '../natureza-operacao/entities/configuracao-imposto-estado.entity';
import { Company } from '../companies/entities/company.entity';
import { Cadastro } from '../cadastros/entities/cadastro.entity';
import { CalcularImpostosPedidoDto } from './dto/calcular-impostos.dto';

describe('CalculadoraImpostosService', () => {
  let service: CalculadoraImpostosService;
  let naturezaRepo: jest.Mocked<Repository<NaturezaOperacao>>;
  let confEstadoRepo: jest.Mocked<Repository<ConfiguracaoImpostoEstado>>;
  let companyRepo: jest.Mocked<Repository<Company>>;
  let cadastroRepo: jest.Mocked<Repository<Cadastro>>;

  const mockCompany = {
    id: '1',
    name: 'Test Company',
    cnpj: '12345678000195',
    address: {
      state: 'SP',
    },
  };

  const mockCliente = {
    id: '1',
    name: 'Test Client',
    enderecos: [
      {
        principal: true,
        estado: 'RJ',
      },
    ],
  };

  const mockNaturezaOperacao = {
    id: '1',
    nome: 'Venda',
    codigo: '1102',
  };

  const mockConfiguracaoEstado = {
    id: '1',
    naturezaOperacaoId: '1',
    uf: 'RJ',
    icmsCST: '00',
    icmsAliquota: 18,
    icmsIncluirFrete: false,
    icmsIncluirDespesas: false,
    icmsReducaoBase: 0,
    icmsMVA: 0,
    icmsStAliquota: 18,
    icmsStReducaoBase: 0,
    ipiCST: '00',
    ipiAliquota: 5,
    ipiIncluirFrete: false,
    ipiIncluirDespesas: false,
    ipiReducaoBase: 0,
    pisCST: '01',
    pisAliquota: 1.65,
    pisIncluirFrete: false,
    pisIncluirDespesas: false,
    pisReducaoBase: 0,
    cofinsCST: '01',
    cofinsAliquota: 7.6,
    cofinsIncluirFrete: false,
    cofinsIncluirDespesas: false,
    cofinsReducaoBase: 0,
    issAliquota: 5,
    issIncluirFrete: false,
    issIncluirDespesas: false,
    issReducaoBase: 0,
    csllAliquota: 1,
    csllIncluirFrete: false,
    csllIncluirDespesas: false,
    csllReducaoBase: 0,
    pisRetencaoAliquota: 0,
    pisRetencaoIncluirFrete: false,
    pisRetencaoIncluirDespesas: false,
    pisRetencaoReducaoBase: 0,
    inssAliquota: 0,
    inssIncluirFrete: false,
    inssIncluirDespesas: false,
    inssReducaoBase: 0,
    irAliquota: 0,
    irIncluirFrete: false,
    irIncluirDespesas: false,
    irReducaoBase: 0,
    cofinsRetencaoAliquota: 0,
    cofinsRetencaoIncluirFrete: false,
    cofinsRetencaoIncluirDespesas: false,
    cofinsRetencaoReducaoBase: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPedidoDto: CalcularImpostosPedidoDto = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculadoraImpostosService,
        {
          provide: getRepositoryToken(NaturezaOperacao),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ConfiguracaoImpostoEstado),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Company),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Cadastro),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CalculadoraImpostosService>(
      CalculadoraImpostosService,
    );
    naturezaRepo = module.get(getRepositoryToken(NaturezaOperacao));
    confEstadoRepo = module.get(getRepositoryToken(ConfiguracaoImpostoEstado));
    companyRepo = module.get(getRepositoryToken(Company));
    cadastroRepo = module.get(getRepositoryToken(Cadastro));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calcularPedido', () => {
    it('should calculate taxes for a complete order', async () => {
      companyRepo.findOne.mockResolvedValue(mockCompany as any);
      cadastroRepo.findOne.mockResolvedValue(mockCliente as any);
      naturezaRepo.findOne.mockResolvedValue(mockNaturezaOperacao as any);
      confEstadoRepo.findOne.mockResolvedValue(mockConfiguracaoEstado as any);
      confEstadoRepo.find.mockResolvedValue([mockConfiguracaoEstado as any]);

      const result = await service.calcularPedido(mockPedidoDto);

      expect(result).toBeDefined();
      expect(result.itens).toHaveLength(1);
      expect(result.itens[0]).toHaveProperty('pis');
      expect(result.itens[0]).toHaveProperty('cofins');
      expect(result.itens[0]).toHaveProperty('ipi');
      expect(result.itens[0]).toHaveProperty('icms');
      expect(result.totais).toHaveProperty('totalProdutos');
      expect(result.totais).toHaveProperty('totalImpostos');
      expect(result.totais).toHaveProperty('totalPedido');
    });

    it('should throw NotFoundException when company is not found', async () => {
      companyRepo.findOne.mockResolvedValue(null);

      await expect(service.calcularPedido(mockPedidoDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when natureza operacao is not found', async () => {
      companyRepo.findOne.mockResolvedValue(mockCompany as any);
      naturezaRepo.findOne.mockResolvedValue(null);

      await expect(service.calcularPedido(mockPedidoDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should use default configuration when no state configuration is found', async () => {
      companyRepo.findOne.mockResolvedValue(mockCompany as any);
      cadastroRepo.findOne.mockResolvedValue(mockCliente as any);
      naturezaRepo.findOne.mockResolvedValue(mockNaturezaOperacao as any);
      confEstadoRepo.findOne.mockResolvedValue(null);
      confEstadoRepo.find.mockResolvedValue([]);

      const result = await service.calcularPedido(mockPedidoDto);

      expect(result).toBeDefined();
      expect(result.itens).toHaveLength(1);
      expect(result.itens[0].totalImpostos).toBeGreaterThan(0);
    });

    it('should calculate taxes with freight and expenses', async () => {
      const pedidoComFreteDespesas = {
        ...mockPedidoDto,
        incluirFreteTotal: true,
        valorFrete: 50,
        despesas: 25,
      };

      companyRepo.findOne.mockResolvedValue(mockCompany as any);
      cadastroRepo.findOne.mockResolvedValue(mockCliente as any);
      naturezaRepo.findOne.mockResolvedValue(mockNaturezaOperacao as any);
      confEstadoRepo.findOne.mockResolvedValue(mockConfiguracaoEstado as any);
      confEstadoRepo.find.mockResolvedValue([mockConfiguracaoEstado as any]);

      const result = await service.calcularPedido(pedidoComFreteDespesas);

      expect(result).toBeDefined();
      expect(result.totais.totalPedido).toBeGreaterThan(200); // 200 + freight + expenses + taxes
    });

    it('should handle multiple items correctly', async () => {
      const pedidoMultiplosItens = {
        ...mockPedidoDto,
        itens: [
          {
            produtoId: '1',
            nome: 'Produto 1',
            quantidade: 2,
            valorUnitario: 100,
            valorDesconto: 0,
          },
          {
            produtoId: '2',
            nome: 'Produto 2',
            quantidade: 1,
            valorUnitario: 150,
            valorDesconto: 10,
          },
        ],
      };

      companyRepo.findOne.mockResolvedValue(mockCompany as any);
      cadastroRepo.findOne.mockResolvedValue(mockCliente as any);
      naturezaRepo.findOne.mockResolvedValue(mockNaturezaOperacao as any);
      confEstadoRepo.findOne.mockResolvedValue(mockConfiguracaoEstado as any);
      confEstadoRepo.find.mockResolvedValue([mockConfiguracaoEstado as any]);

      const result = await service.calcularPedido(pedidoMultiplosItens);

      expect(result).toBeDefined();
      expect(result.itens).toHaveLength(2);
      expect(result.totais.totalProdutos).toBe(350); // (2*100) + (1*150)
      expect(result.totais.totalDescontos).toBe(10);
    });
  });
});
