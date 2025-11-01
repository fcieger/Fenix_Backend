import { OrcamentosService } from './orcamentos.service';
import { Repository } from 'typeorm';
import { Orcamento, StatusOrcamento } from './entities/orcamento.entity';
import { OrcamentoItem } from './entities/orcamento-item.entity';

function createRepoMock<T>() {
  return {
    create: jest.fn((data) => data),
    save: jest.fn(async (data) => data),
    find: jest.fn(async () => []),
    findOne: jest.fn(async () => null),
    remove: jest.fn(async () => ({})),
    delete: jest.fn(async () => ({})),
  } as unknown as jest.Mocked<Repository<T>>;
}

describe('OrcamentosService', () => {
  let service: OrcamentosService;
  let repo: jest.Mocked<Repository<Orcamento>>;
  let itemRepo: jest.Mocked<Repository<OrcamentoItem>>;

  beforeEach(() => {
    repo = createRepoMock<Orcamento>();
    itemRepo = createRepoMock<OrcamentoItem>();
    service = new OrcamentosService(repo, itemRepo);
  });

  it('recalcula totais de itens e cabeçalho corretamente', async () => {
    const orc: any = {
      itens: [
        { quantidade: 2, precoUnitario: 100, descontoValor: 10, descontoPercentual: 0, freteRateado: 5, seguroRateado: 0, outrasDespesasRateado: 0, icmsValor: 5, ipiValor: 0, pisValor: 0, cofinsValor: 0, icmsStValor: 0 },
        { quantidade: 1, precoUnitario: 50, descontoValor: 0, descontoPercentual: 10, freteRateado: 0, seguroRateado: 0, outrasDespesasRateado: 0, icmsValor: 0, ipiValor: 0, pisValor: 0, cofinsValor: 0, icmsStValor: 0 },
      ],
    } as Orcamento;
    // @ts-expect-error private method access for test
    service.recalcularTotais(orc);
    expect(orc.totalProdutos).toBe(250);
    expect(orc.totalDescontos).toBe(10);
    expect(orc.totalImpostos).toBe(5);
    expect(orc.totalGeral).toBe(250 - 10 + 5 + 5 - 5); // item1: 2*100 -10 +5 +5 = 200; item2: 1*50 -5 = 45; total = 245
    expect(orc.totalGeral).toBe(245);
  });

  it('altera status', async () => {
    const existing: any = { id: '1', status: StatusOrcamento.PENDENTE, itens: [] };
    repo.findOne = jest.fn(async () => existing as Orcamento);
    repo.save = jest.fn(async (data) => data as any);
    const res = await service.changeStatus('1', StatusOrcamento.CONCLUIDO);
    expect(res.status).toBe(StatusOrcamento.CONCLUIDO);
  });

  it('cria, atualiza (sem alterar companyId) e deleta', async () => {
    const created: any = {
      id: '1', companyId: 'c1', itens: [], dataEmissao: new Date(), totalGeral: 0,
    };
    repo.create = jest.fn((d: any) => ({ ...d, id: '1' } as any));
    repo.save = jest.fn(async (d: any) => d);
    const resultCreate = await service.create({
      companyId: 'c1', clienteId: 'cli', dataEmissao: new Date().toISOString().slice(0,10), itens: [],
    } as any);
    expect(resultCreate.id).toBe('1');

    repo.findOne = jest.fn(async () => ({ ...created } as any));
    const resultUpdate = await service.update('1', { companyId: 'c1', observacoes: 'ok' } as any);
    expect(resultUpdate.observacoes).toBe('ok');

    await expect(service.update('1', { companyId: 'c2' } as any)).rejects.toBeTruthy();

    repo.remove = jest.fn(async () => ({} as any));
    const resultRemove = await service.remove('1');
    expect(resultRemove.ok).toBe(true);
  });

  it('filtra por período (Between, >=, <=)', async () => {
    repo.find = jest.fn(async (args: any) => [] as any);
    await service.findAll({ inicio: '2025-01-01', fim: '2025-01-31' } as any);
    expect(repo.find).toHaveBeenCalled();
    await service.findAll({ inicio: '2025-01-01' } as any);
    expect(repo.find).toHaveBeenCalled();
    await service.findAll({ fim: '2025-01-31' } as any);
    expect(repo.find).toHaveBeenCalled();
  });
});


