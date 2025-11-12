import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LicitacoesService } from './licitacoes.service';
import { Licitacao } from './entities/licitacao.entity';
import { AlertaLicitacao } from './entities/alerta-licitacao.entity';
import { AggregatorService } from './integrations/aggregator.service';
import { PncpService } from './integrations/pncp.service';

describe('LicitacoesService', () => {
  let service: LicitacoesService;
  let licitacaoRepository: Repository<Licitacao>;
  let alertaRepository: Repository<AlertaLicitacao>;

  const mockLicitacao = {
    id: '1',
    numeroProcesso: '001/2024',
    titulo: 'Teste',
    descricao: 'Descrição teste',
    orgao: 'Órgão Teste',
    modalidade: 'Pregão Eletrônico',
    esfera: 'Federal',
    estado: 'SP',
    valorEstimado: 10000,
    dataAbertura: new Date(),
    status: 'Aberta',
    fonte: 'PNCP',
    visualizacoes: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicitacoesService,
        {
          provide: getRepositoryToken(Licitacao),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getCount: jest.fn().mockResolvedValue(1),
              getMany: jest.fn().mockResolvedValue([mockLicitacao]),
            })),
          },
        },
        {
          provide: getRepositoryToken(AlertaLicitacao),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AggregatorService,
          useValue: {
            buscarTodasLicitacoes: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PncpService,
          useValue: {
            buscarLicitacoes: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<LicitacoesService>(LicitacoesService);
    licitacaoRepository = module.get<Repository<Licitacao>>(
      getRepositoryToken(Licitacao),
    );
    alertaRepository = module.get<Repository<AlertaLicitacao>>(
      getRepositoryToken(AlertaLicitacao),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('listar', () => {
    it('should return paginated licitacoes', async () => {
      const result = await service.listar({ pagina: 1, limite: 20 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('pagina');
      expect(result).toHaveProperty('limite');
      expect(result).toHaveProperty('totalPaginas');
    });
  });

  describe('buscarPorId', () => {
    it('should return a licitacao by id', async () => {
      jest.spyOn(licitacaoRepository, 'findOne').mockResolvedValue(mockLicitacao as any);
      jest.spyOn(licitacaoRepository, 'update').mockResolvedValue(undefined);

      const result = await service.buscarPorId('1');

      expect(result).toEqual(mockLicitacao);
      expect(licitacaoRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if licitacao not found', async () => {
      jest.spyOn(licitacaoRepository, 'findOne').mockResolvedValue(null);

      await expect(service.buscarPorId('999')).rejects.toThrow();
    });
  });

  describe('estatisticas', () => {
    it('should return statistics', async () => {
      jest.spyOn(licitacaoRepository, 'count').mockResolvedValue(10);

      const result = await service.estatisticas();

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('abertas');
      expect(result).toHaveProperty('encerrandoEmBreve');
    });
  });

  describe('criarAlerta', () => {
    it('should create an alerta', async () => {
      const alertaDto = {
        nome: 'Teste Alerta',
        ativo: true,
        notificarEmail: true,
        frequencia: 'diaria' as const,
      };

      jest.spyOn(alertaRepository, 'create').mockReturnValue(alertaDto as any);
      jest.spyOn(alertaRepository, 'save').mockResolvedValue({ id: '1', ...alertaDto } as any);

      const result = await service.criarAlerta('user-1', alertaDto);

      expect(result).toHaveProperty('id');
      expect(result.nome).toBe('Teste Alerta');
    });
  });

  describe('listarAlertas', () => {
    it('should return user alertas', async () => {
      const mockAlertas = [
        { id: '1', nome: 'Alerta 1', userId: 'user-1' },
        { id: '2', nome: 'Alerta 2', userId: 'user-1' },
      ];

      jest.spyOn(alertaRepository, 'find').mockResolvedValue(mockAlertas as any);

      const result = await service.listarAlertas('user-1');

      expect(result).toHaveLength(2);
      expect(alertaRepository.find).toHaveBeenCalled();
    });
  });
});


