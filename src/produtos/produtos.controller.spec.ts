import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';

describe('ProdutosController', () => {
  let controller: ProdutosController;
  let service: jest.Mocked<ProdutosService>;

  const mockCompanyId = 'company-1';
  const mockProdutoId = 'produto-1';

  const mockProduto = {
    id: mockProdutoId,
    companyId: mockCompanyId,
    nome: 'Produto Teste',
    apelido: 'Prod Test',
    sku: 'SKU001',
    descricao: 'Descrição do produto teste',
    ativo: true,
    tipoProduto: 'MERCADORIA',
    unidadeMedida: 'UN',
    marca: 'Marca Teste',
    referencia: 'REF001',
    codigoBarras: '1234567890123',
    ncm: '12345678',
    cest: '1234567',
    custo: 50.0,
    preco: 100.0,
    peso: 1.5,
    altura: 10.0,
    largura: 15.0,
    profundidade: 20.0,
    cor: 'Azul',
    tamanho: 'M',
    material: 'Algodão',
    fabricante: 'Fabricante Teste',
    paisOrigem: 'Brasil',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: {
      companies: [
        {
          id: mockCompanyId,
          name: 'Test Company',
        },
      ],
    },
  };

  const mockRequestWithoutCompanies = {
    user: {
      companies: [],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutosController],
      providers: [
        {
          provide: ProdutosService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProdutosController>(ProdutosController);
    service = module.get(ProdutosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new produto', async () => {
      const createDto: CreateProdutoDto = {
        nome: 'Produto Teste',
        apelido: 'Prod Test',
        sku: 'SKU001',
        descricao: 'Descrição do produto teste',
        ativo: true,
        tipoProduto: 'MERCADORIA',
        unidadeMedida: 'UN',
        marca: 'Marca Teste',
        referencia: 'REF001',
        codigoBarras: '1234567890123',
        ncm: '12345678',
        cest: '1234567',
        custo: 50.0,
        preco: 100.0,
      };

      service.create.mockResolvedValue(mockProduto as any);

      const result = await controller.create(createDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createDto, mockCompanyId);
      expect(result).toEqual(mockProduto);
    });

    it('should throw error when user has no companies', async () => {
      const createDto: CreateProdutoDto = {
        nome: 'Produto Teste',
      };

      await expect(
        controller.create(createDto, mockRequestWithoutCompanies),
      ).rejects.toThrow('Usuário não possui empresas associadas');
    });

    it('should create produto with minimal data', async () => {
      const minimalDto: CreateProdutoDto = {
        nome: 'Produto Mínimo',
      };

      const minimalProduto = {
        ...mockProduto,
        nome: 'Produto Mínimo',
      };

      service.create.mockResolvedValue(minimalProduto as any);

      const result = await controller.create(minimalDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(minimalDto, mockCompanyId);
      expect(result).toEqual(minimalProduto);
    });
  });

  describe('findAll', () => {
    it('should return all produtos for authenticated user', async () => {
      const mockProdutos = [mockProduto];
      service.findAll.mockResolvedValue(mockProdutos);

      const result = await controller.findAll(mockRequest);

      expect(service.findAll).toHaveBeenCalledWith(mockCompanyId);
      expect(result).toEqual(mockProdutos);
    });

    it('should return produtos for hardcoded company when no user', async () => {
      const mockProdutos = [mockProduto];
      const emptyRequest = {};

      service.findAll.mockResolvedValue(mockProdutos);

      const result = await controller.findAll(emptyRequest);

      expect(service.findAll).toHaveBeenCalledWith(
        '2c650c76-4e2a-4b58-933c-c3f8b7434d80',
      );
      expect(result).toEqual(mockProdutos);
    });

    it('should return empty array when no produtos found', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific produto', async () => {
      service.findOne.mockResolvedValue(mockProduto as any);

      const result = await controller.findOne(mockProdutoId, mockRequest);

      expect(service.findOne).toHaveBeenCalledWith(
        mockProdutoId,
        mockCompanyId,
      );
      expect(result).toEqual(mockProduto);
    });

    it('should return null when produto not found', async () => {
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(mockProdutoId, mockRequest);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a produto', async () => {
      const updateDto = {
        nome: 'Produto Atualizado',
        preco: 150.0,
      };

      const updatedProduto = {
        ...mockProduto,
        nome: 'Produto Atualizado',
        preco: 150.0,
      };

      service.update.mockResolvedValue(updatedProduto as any);

      const result = await controller.update(
        mockProdutoId,
        updateDto,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledWith(
        mockProdutoId,
        updateDto,
        mockCompanyId,
      );
      expect(result).toEqual(updatedProduto);
    });

    it('should update produto with fiscal information', async () => {
      const fiscalUpdateDto = {
        ncm: '87654321',
        cest: '7654321',
        origemProdutoSped: '0',
        tipoProdutoSped: '00',
      };

      const updatedProduto = {
        ...mockProduto,
        ...fiscalUpdateDto,
      };

      service.update.mockResolvedValue(updatedProduto as any);

      const result = await controller.update(
        mockProdutoId,
        fiscalUpdateDto,
        mockRequest,
      );

      expect(service.update).toHaveBeenCalledWith(
        mockProdutoId,
        fiscalUpdateDto,
        mockCompanyId,
      );
      expect(result).toEqual(updatedProduto);
    });

    it('should return null when produto not found for update', async () => {
      const updateDto = {
        nome: 'Produto Atualizado',
      };

      service.update.mockResolvedValue(null);

      const result = await controller.update(
        mockProdutoId,
        updateDto,
        mockRequest,
      );

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a produto', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockProdutoId, mockRequest);

      expect(service.remove).toHaveBeenCalledWith(mockProdutoId, mockCompanyId);
      expect(result).toEqual({ message: 'Produto removido com sucesso' });
    });

    it('should handle deletion of non-existent produto', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockProdutoId, mockRequest);

      expect(result).toEqual({ message: 'Produto removido com sucesso' });
    });
  });

  describe('produto business scenarios', () => {
    it('should handle produto with marketplace integration', async () => {
      const marketplaceDto: CreateProdutoDto = {
        nome: 'Produto Marketplace',
        integracaoMarketplace: true,
        usarApelidoComoNomePrincipal: true,
        apelido: 'Produto Principal',
        sku: 'MP001',
        codigoBarras: '9876543210987',
      };

      const marketplaceProduto = {
        ...mockProduto,
        ...marketplaceDto,
      };

      service.create.mockResolvedValue(marketplaceProduto as any);

      const result = await controller.create(marketplaceDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(
        marketplaceDto,
        mockCompanyId,
      );
      expect(result).toEqual(marketplaceProduto);
    });

    it('should handle produto with complex packaging', async () => {
      const packagingDto: CreateProdutoDto = {
        nome: 'Produto com Embalagem',
        alturaEmbalagem: 30.0,
        larguraEmbalagem: 35.0,
        profundidadeEmbalagem: 45.0,
        pesoEmbalagem: 0.5,
        quantidadePorEmbalagem: 12,
        tipoEmbalagem: 'Caixa',
        peso: 2.5,
        pesoLiquido: 2.0,
        pesoBruto: 3.0,
      };

      const packagingProduto = {
        ...mockProduto,
        ...packagingDto,
      };

      service.create.mockResolvedValue(packagingProduto as any);

      const result = await controller.create(packagingDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(packagingDto, mockCompanyId);
      expect(result).toEqual(packagingProduto);
    });
  });
});
