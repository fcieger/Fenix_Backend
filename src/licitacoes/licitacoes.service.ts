import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Licitacao } from './entities/licitacao.entity';
import { AlertaLicitacao } from './entities/alerta-licitacao.entity';
import { SearchLicitacaoDto } from './dto/search-licitacao.dto';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';
import { AggregatorService } from './integrations/aggregator.service';
import { PncpService } from './integrations/pncp.service';

@Injectable()
export class LicitacoesService {
  private readonly logger = new Logger(LicitacoesService.name);

  constructor(
    @InjectRepository(Licitacao)
    private readonly licitacaoRepository: Repository<Licitacao>,
    @InjectRepository(AlertaLicitacao)
    private readonly alertaRepository: Repository<AlertaLicitacao>,
    private readonly aggregatorService: AggregatorService,
    private readonly pncpService: PncpService,
  ) {}

  async listar(filtros: SearchLicitacaoDto) {
    const { pagina = 1, limite = 20, ...where } = filtros;
    
    const query = this.licitacaoRepository.createQueryBuilder('licitacao');

    if (where.estado) {
      query.andWhere('licitacao.estado = :estado', { estado: where.estado });
    }

    if (where.municipio) {
      query.andWhere('licitacao.municipio ILIKE :municipio', { 
        municipio: `%${where.municipio}%` 
      });
    }

    if (where.status) {
      query.andWhere('licitacao.status = :status', { status: where.status });
    }

    if (where.valorMinimo) {
      query.andWhere('licitacao.valorEstimado >= :valorMinimo', { 
        valorMinimo: where.valorMinimo 
      });
    }

    if (where.valorMaximo) {
      query.andWhere('licitacao.valorEstimado <= :valorMaximo', { 
        valorMaximo: where.valorMaximo 
      });
    }

    if (where.busca) {
      query.andWhere(
        '(licitacao.titulo ILIKE :busca OR licitacao.descricao ILIKE :busca)',
        { busca: `%${where.busca}%` }
      );
    }

    if (where.modalidades && where.modalidades.length > 0) {
      query.andWhere('licitacao.modalidade IN (:...modalidades)', { 
        modalidades: where.modalidades 
      });
    }

    const total = await query.getCount();
    
    const licitacoes = await query
      .orderBy('licitacao.dataAbertura', 'DESC')
      .skip((pagina - 1) * limite)
      .take(limite)
      .getMany();

    return {
      data: licitacoes,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async buscarPorId(id: string) {
    const licitacao = await this.licitacaoRepository.findOne({ 
      where: { id } 
    });

    if (!licitacao) {
      throw new NotFoundException(`Licitação ${id} não encontrada`);
    }

    await this.licitacaoRepository.update(id, {
      visualizacoes: licitacao.visualizacoes + 1,
    });

    return licitacao;
  }

  async sincronizar(fonte: 'pncp' | 'compras-gov' | 'todas' = 'todas') {
    this.logger.log(`Iniciando sincronização: ${fonte}`);

    try {
      let licitacoes: any[] = [];

      if (fonte === 'pncp') {
        licitacoes = await this.pncpService.buscarLicitacoes({ limite: 100 });
      } else if (fonte === 'todas') {
        licitacoes = await this.aggregatorService.buscarTodasLicitacoes({ limite: 100 });
      }

      let salvos = 0;
      let atualizados = 0;

      for (const lic of licitacoes) {
        const existente = await this.licitacaoRepository.findOne({
          where: {
            numeroProcesso: lic.numeroProcesso,
            fonte: lic.fonte,
          },
        });

        if (existente) {
          await this.licitacaoRepository.update(existente.id, {
            ...lic,
            sincronizadoEm: new Date(),
          });
          atualizados++;
        } else {
          await this.licitacaoRepository.save({
            ...lic,
            sincronizadoEm: new Date(),
          });
          salvos++;
        }
      }

      this.logger.log(`✅ Sincronização concluída: ${salvos} novos, ${atualizados} atualizados`);

      return {
        sucesso: true,
        novos: salvos,
        atualizados,
        total: licitacoes.length,
      };
    } catch (error) {
      this.logger.error(`❌ Erro na sincronização: ${error.message}`);
      throw error;
    }
  }

  async estatisticas() {
    const total = await this.licitacaoRepository.count();
    const abertas = await this.licitacaoRepository.count({ 
      where: { status: 'Aberta' } 
    });

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 7);

    const encerrandoEmBreve = await this.licitacaoRepository.count({
      where: {
        status: 'Aberta',
        dataLimite: LessThanOrEqual(dataLimite),
      },
    });

    return {
      total,
      abertas,
      encerrandoEmBreve,
      matches: 0,
    };
  }

  async buscarMatches(companyId: string) {
    return this.licitacaoRepository.find({
      where: { status: 'Aberta' },
      take: 10,
      order: { dataAbertura: 'DESC' },
    });
  }

  async criarAlerta(userId: string, dto: CreateAlertaDto) {
    const alerta = this.alertaRepository.create({
      ...dto,
      userId,
    });

    return this.alertaRepository.save(alerta);
  }

  async listarAlertas(userId: string) {
    return this.alertaRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async atualizarAlerta(id: string, dto: UpdateAlertaDto) {
    await this.alertaRepository.update(id, dto);
    return this.alertaRepository.findOne({ where: { id } });
  }

  async deletarAlerta(id: string) {
    await this.alertaRepository.delete(id);
    return { sucesso: true };
  }
}


