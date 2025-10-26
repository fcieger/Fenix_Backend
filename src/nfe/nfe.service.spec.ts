import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NfeService } from './nfe.service';
import { Nfe } from './entities/nfe.entity';
import { NfeItem } from './entities/nfe-item.entity';
import { NfeDuplicata } from './entities/nfe-duplicata.entity';
import { ConfiguracaoNfeService } from '../configuracao-nfe/configuracao-nfe.service';
import { NaturezaOperacaoService } from '../natureza-operacao/natureza-operacao.service';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { UpdateNfeDto } from './dto/update-nfe.dto';
import { NfeStatus } from './enums/nfe-status.enum';

describe('NfeService', () => {
  let service: NfeService;
  let nfeRepository: jest.Mocked<Repository<Nfe>>;
  let nfeItemRepository: jest.Mocked<Repository<NfeItem>>;
  let nfeDuplicataRepository: jest.Mocked<Repository<NfeDuplicata>>;
  let dataSource: jest.Mocked<DataSource>;
  let configuracaoNfeService: jest.Mocked<ConfiguracaoNfeService>;
  let naturezaOperacaoService: jest.Mocked<NaturezaOperacaoService>;

  const mockCompanyId = 'company-1';
  const mockNfeId = 'nfe-1';

  const mockConfiguracaoNfe = {
    id: 'config-1',
    ativo: true,
    serie: '1',
    modelo: '55',
    ambiente: 'HOMOLOGACAO',
    proximoNumero: 1,
  };

  const mockCreateNfeDto: CreateNfeDto = {
    configuracaoNfeId: 'config-1',
    naturezaOperacaoId: 'natureza-1',
    tipoOperacao: 'SAIDA',
    finalidade: 'NORMAL',
    consumidorFinal: true,
    indicadorPresenca: 'PRESENCIAL',
    destinatarioTipo: 'PESSOA_FISICA',
    destinatarioCnpjCpf: '12345678901',
    destinatarioRazaoSocial: 'Cliente Teste',
    destinatarioUF: 'SP',
    destinatarioMunicipio: 'São Paulo',
    destinatarioCEP: '01234567',
    dataEmissao: new Date(),
    itens: [
      {
        produtoId: 'produto-1',
        codigo: 'PROD001',
        descricao: 'Produto Teste',
        ncm: '12345678',
        cfop: '5102',
        unidadeComercial: 'UN',
        quantidade: 2,
        valorUnitario: 100,
        valorTotal: 200,
      },
    ],
  };

  const mockNfe = {
    id: mockNfeId,
    companyId: mockCompanyId,
    numeroNfe: '000000001',
    serie: '1',
    modelo: '55',
    status: NfeStatus.RASCUNHO,
    ambiente: 'HOMOLOGACAO',
    valorTotalNota: 200,
    destinatarioRazaoSocial: 'Cliente Teste',
    destinatarioCnpjCpf: '12345678901',
    destinatarioUF: 'SP',
    itens: [],
    duplicatas: [],
  };

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn().mockImplementation((entity) => {
          if (entity === mockNfe) {
            return Promise.resolve({ ...mockNfe, id: mockNfeId });
          }
          return Promise.resolve(entity);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfeService,
        {
          provide: getRepositoryToken(Nfe),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            query: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(NfeItem),
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(NfeDuplicata),
          useValue: {
            create: jest.fn(),
            delete: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
        {
          provide: ConfiguracaoNfeService,
          useValue: {
            findOneWithCredentials: jest.fn(),
            incrementarNumero: jest.fn(),
          },
        },
        {
          provide: NaturezaOperacaoService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<NfeService>(NfeService);
    nfeRepository = module.get(getRepositoryToken(Nfe));
    nfeItemRepository = module.get(getRepositoryToken(NfeItem));
    nfeDuplicataRepository = module.get(getRepositoryToken(NfeDuplicata));
    dataSource = module.get(DataSource);
    configuracaoNfeService = module.get(ConfiguracaoNfeService);
    naturezaOperacaoService = module.get(NaturezaOperacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new NFe successfully', async () => {
      configuracaoNfeService.findOneWithCredentials.mockResolvedValue(
        mockConfiguracaoNfe as any,
      );
      configuracaoNfeService.incrementarNumero.mockResolvedValue(1);
      nfeRepository.create.mockReturnValue(mockNfe as any);
      nfeItemRepository.create.mockReturnValue({} as any);
      nfeRepository.findOne.mockResolvedValue({
        ...mockNfe,
        id: mockNfeId,
      } as any);

      const result = await service.create(mockCompanyId, mockCreateNfeDto);

      expect(
        configuracaoNfeService.findOneWithCredentials,
      ).toHaveBeenCalledWith(mockCreateNfeDto.configuracaoNfeId, mockCompanyId);
      expect(configuracaoNfeService.incrementarNumero).toHaveBeenCalledWith(
        mockCreateNfeDto.configuracaoNfeId,
        mockCompanyId,
      );
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when configuration is inactive', async () => {
      const inactiveConfig = { ...mockConfiguracaoNfe, ativo: false };
      configuracaoNfeService.findOneWithCredentials.mockResolvedValue(
        inactiveConfig as any,
      );

      await expect(
        service.create(mockCompanyId, mockCreateNfeDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all NFes for a company', async () => {
      const mockNfes = [
        {
          id: 'nfe-1',
          companyId: mockCompanyId,
          numeroNfe: '000000001',
          status: NfeStatus.RASCUNHO,
          dataEmissao: new Date(),
          valorTotalNota: 200,
          destinatarioRazaoSocial: 'Cliente Teste',
          destinatarioCnpjCpf: '12345678901',
          destinatarioUF: 'SP',
        },
      ];

      nfeRepository.query.mockResolvedValue(mockNfes);

      const result = await service.findAll(mockCompanyId);

      expect(nfeRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [mockCompanyId],
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 'nfe-1');
    });
  });

  describe('findOne', () => {
    it('should return a specific NFe', async () => {
      nfeRepository.findOne.mockResolvedValue(mockNfe as any);

      const result = await service.findOne(mockNfeId, mockCompanyId);

      expect(nfeRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockNfeId, companyId: mockCompanyId },
        relations: ['itens', 'duplicatas'],
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when NFe is not found', async () => {
      nfeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockNfeId, mockCompanyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a draft NFe', async () => {
      const updateDto: UpdateNfeDto = {
        destinatarioRazaoSocial: 'Cliente Atualizado',
      };

      nfeRepository.findOne.mockResolvedValue(mockNfe as any);
      nfeRepository.save.mockResolvedValue({ ...mockNfe, ...updateDto } as any);
      nfeRepository.findOne
        .mockResolvedValueOnce(mockNfe as any)
        .mockResolvedValueOnce({ ...mockNfe, ...updateDto } as any);

      const result = await service.update(mockNfeId, mockCompanyId, updateDto);

      expect(nfeRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockNfeId, companyId: mockCompanyId },
        relations: ['itens', 'duplicatas'],
      });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when trying to update non-draft NFe', async () => {
      const publishedNfe = { ...mockNfe, status: NfeStatus.AUTORIZADA };
      const updateDto: UpdateNfeDto = {
        destinatarioRazaoSocial: 'Cliente Atualizado',
      };

      nfeRepository.findOne.mockResolvedValue(publishedNfe as any);

      await expect(
        service.update(mockNfeId, mockCompanyId, updateDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when NFe is not found', async () => {
      const updateDto: UpdateNfeDto = {
        destinatarioRazaoSocial: 'Cliente Atualizado',
      };

      nfeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(mockNfeId, mockCompanyId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a draft NFe', async () => {
      nfeRepository.findOne.mockResolvedValue(mockNfe as any);
      nfeRepository.remove.mockResolvedValue(mockNfe as any);

      await service.remove(mockNfeId, mockCompanyId);

      expect(nfeRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockNfeId, companyId: mockCompanyId },
      });
      expect(nfeRepository.remove).toHaveBeenCalledWith(mockNfe);
    });

    it('should throw BadRequestException when trying to delete non-draft NFe', async () => {
      const publishedNfe = { ...mockNfe, status: NfeStatus.AUTORIZADA };
      nfeRepository.findOne.mockResolvedValue(publishedNfe as any);

      await expect(service.remove(mockNfeId, mockCompanyId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when NFe is not found', async () => {
      nfeRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockNfeId, mockCompanyId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('calcularImpostos', () => {
    it('should calculate taxes for items', async () => {
      const calcularDto = {
        naturezaOperacaoId: 'natureza-1',
        ufOrigem: 'SP',
        ufDestino: 'RJ',
        itens: [
          {
            valorTotal: 200,
          },
        ],
      };

      const result = await service.calcularImpostos(calcularDto);

      expect(result).toHaveProperty('valorTotalProdutos', 200);
      expect(result).toHaveProperty('valorICMS');
      expect(result).toHaveProperty('valorIPI');
      expect(result).toHaveProperty('valorPIS');
      expect(result).toHaveProperty('valorCOFINS');
      expect(result).toHaveProperty('valorTotalNota');
    });
  });
});
