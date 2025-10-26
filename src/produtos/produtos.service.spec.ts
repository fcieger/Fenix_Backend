import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutosService } from './produtos.service';
import { Produto } from './entities/produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';

describe('ProdutosService', () => {
  let service: ProdutosService;
  let produtosRepository: jest.Mocked<Repository<Produto>>;

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

  const mockCreateProdutoDto: CreateProdutoDto = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        {
          provide: getRepositoryToken(Produto),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProdutosService>(ProdutosService);
    produtosRepository = module.get(getRepositoryToken(Produto));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new produto', async () => {
      produtosRepository.create.mockReturnValue(mockProduto as any);
      produtosRepository.save.mockResolvedValue(mockProduto as any);

      const result = await service.create(mockCreateProdutoDto, mockCompanyId);

      expect(produtosRepository.create).toHaveBeenCalledWith({
        ...mockCreateProdutoDto,
        companyId: mockCompanyId,
      });
      expect(produtosRepository.save).toHaveBeenCalledWith(mockProduto);
      expect(result).toEqual(mockProduto);
    });

    it('should create produto with minimal data', async () => {
      const minimalDto = {
        nome: 'Produto Mínimo',
      };

      const minimalProduto = {
        ...mockProduto,
        nome: 'Produto Mínimo',
        apelido: undefined,
        sku: undefined,
        descricao: undefined,
      };

      produtosRepository.create.mockReturnValue(minimalProduto as any);
      produtosRepository.save.mockResolvedValue(minimalProduto as any);

      const result = await service.create(minimalDto, mockCompanyId);

      expect(produtosRepository.create).toHaveBeenCalledWith({
        ...minimalDto,
        companyId: mockCompanyId,
      });
      expect(result).toEqual(minimalProduto);
    });
  });

  describe('findAll', () => {
    it('should return all produtos for a company', async () => {
      const mockProdutos = [mockProduto];
      produtosRepository.find.mockResolvedValue(mockProdutos);

      const result = await service.findAll(mockCompanyId);

      expect(produtosRepository.find).toHaveBeenCalledWith({
        where: { companyId: mockCompanyId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockProdutos);
    });

    it('should return empty array when no produtos found', async () => {
      produtosRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockCompanyId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a specific produto', async () => {
      produtosRepository.findOne.mockResolvedValue(mockProduto as any);

      const result = await service.findOne(mockProdutoId, mockCompanyId);

      expect(produtosRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProdutoId, companyId: mockCompanyId },
      });
      expect(result).toEqual(mockProduto);
    });

    it('should return null when produto not found', async () => {
      produtosRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(mockProdutoId, mockCompanyId);

      expect(result).toBeNull();
    });

    it('should return null when produto belongs to different company', async () => {
      produtosRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(mockProdutoId, 'other-company');

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

      produtosRepository.update.mockResolvedValue({ affected: 1 } as any);
      produtosRepository.findOne.mockResolvedValue(updatedProduto as any);

      const result = await service.update(
        mockProdutoId,
        updateDto,
        mockCompanyId,
      );

      expect(produtosRepository.update).toHaveBeenCalledWith(
        { id: mockProdutoId, companyId: mockCompanyId },
        updateDto,
      );
      expect(produtosRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProdutoId, companyId: mockCompanyId },
      });
      expect(result).toEqual(updatedProduto);
    });

    it('should return null when produto not found for update', async () => {
      const updateDto = {
        nome: 'Produto Atualizado',
      };

      produtosRepository.update.mockResolvedValue({ affected: 0 } as any);
      produtosRepository.findOne.mockResolvedValue(null);

      const result = await service.update(
        mockProdutoId,
        updateDto,
        mockCompanyId,
      );

      expect(result).toBeNull();
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

      produtosRepository.update.mockResolvedValue({ affected: 1 } as any);
      produtosRepository.findOne.mockResolvedValue(updatedProduto as any);

      const result = await service.update(
        mockProdutoId,
        fiscalUpdateDto,
        mockCompanyId,
      );

      expect(produtosRepository.update).toHaveBeenCalledWith(
        { id: mockProdutoId, companyId: mockCompanyId },
        fiscalUpdateDto,
      );
      expect(result).toEqual(updatedProduto);
    });
  });

  describe('remove', () => {
    it('should delete a produto', async () => {
      produtosRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(mockProdutoId, mockCompanyId);

      expect(produtosRepository.delete).toHaveBeenCalledWith({
        id: mockProdutoId,
        companyId: mockCompanyId,
      });
    });

    it('should handle deletion of non-existent produto', async () => {
      produtosRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await service.remove(mockProdutoId, mockCompanyId);

      expect(produtosRepository.delete).toHaveBeenCalledWith({
        id: mockProdutoId,
        companyId: mockCompanyId,
      });
    });
  });

  describe('produto validation scenarios', () => {
    it('should handle produto with complex dimensions', async () => {
      const complexProdutoDto = {
        nome: 'Produto Complexo',
        peso: 2.5,
        altura: 25.5,
        largura: 30.0,
        profundidade: 40.0,
        pesoLiquido: 2.0,
        pesoBruto: 3.0,
        alturaEmbalagem: 30.0,
        larguraEmbalagem: 35.0,
        profundidadeEmbalagem: 45.0,
        pesoEmbalagem: 0.5,
        quantidadePorEmbalagem: 12,
        tipoEmbalagem: 'Caixa',
      };

      const complexProduto = {
        ...mockProduto,
        ...complexProdutoDto,
      };

      produtosRepository.create.mockReturnValue(complexProduto as any);
      produtosRepository.save.mockResolvedValue(complexProduto as any);

      const result = await service.create(complexProdutoDto, mockCompanyId);

      expect(result).toEqual(complexProduto);
    });

    it('should handle produto with technical specifications', async () => {
      const technicalProdutoDto = {
        nome: 'Produto Técnico',
        voltagem: '220V',
        potencia: '1500W',
        capacidade: '50L',
        garantiaMeses: 24,
        certificacoes: 'INMETRO, CE',
        normasTecnicas: 'NBR 12345',
        linkFichaTecnica: 'https://example.com/ficha-tecnica',
        observacoesTecnicas: 'Produto certificado conforme normas técnicas',
      };

      const technicalProduto = {
        ...mockProduto,
        ...technicalProdutoDto,
      };

      produtosRepository.create.mockReturnValue(technicalProduto as any);
      produtosRepository.save.mockResolvedValue(technicalProduto as any);

      const result = await service.create(technicalProdutoDto, mockCompanyId);

      expect(result).toEqual(technicalProduto);
    });
  });
});
