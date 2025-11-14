import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { PncpService } from './pncp.service';

describe('PncpService', () => {
  let service: PncpService;
  let httpService: HttpService;

  const mockLicitacaoResponse = {
    data: [
      {
        numeroControlePNCP: '00001234567890123456',
        objetoCompra: 'Teste de objeto',
        informacaoComplementar: 'Informação adicional',
        valorTotalEstimado: 50000,
        ufSigla: 'SP',
        situacaoCompra: 'Em andamento',
        dataPublicacaoPncp: '2024-11-01T10:00:00Z',
        orgaoEntidade: {
          razaoSocial: 'Prefeitura de São Paulo',
          sigla: 'PMSP',
        },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PncpService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PncpService>(PncpService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buscarLicitacoes', () => {
    it('should return normalized licitacoes', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockLicitacaoResponse) as any);

      const result = await service.buscarLicitacoes({ limite: 10 });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('numeroProcesso');
      expect(result[0]).toHaveProperty('titulo');
      expect(result[0]).toHaveProperty('fonte', 'PNCP');
    });

    it('should return empty array on error', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          ...mockLicitacaoResponse,
          status: 404,
        }) as any,
      );

      const result = await service.buscarLicitacoes({ limite: 10 });

      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('buscarDetalhes', () => {
    it('should return licitacao details', async () => {
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({ data: mockLicitacaoResponse.data[0] }) as any,
      );

      const result = await service.buscarDetalhes('123');

      expect(result).toHaveProperty('numeroProcesso');
      expect(result).toHaveProperty('fonte', 'PNCP');
    });
  });
});



