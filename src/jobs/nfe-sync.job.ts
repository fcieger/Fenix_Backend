import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, LessThan } from 'typeorm';
import { Nfe } from '../nfe/entities/nfe.entity';
import { NfeStatus } from '../nfe/enums/nfe-status.enum';
import { NFeIntegrationService } from '../nfe-integration/nfe-integration.service';

@Injectable()
export class NFeSyncJob {
  private readonly logger = new Logger(NFeSyncJob.name);

  constructor(
    @InjectRepository(Nfe)
    private readonly nfeRepository: Repository<Nfe>,
    private readonly nfeIntegrationService: NFeIntegrationService,
  ) {}

  /**
   * Job de sincronização automática - executa a cada 2 minutos
   */
  @Cron('*/2 * * * *')
  async sincronizarNFePendentes() {
    this.logger.log('Iniciando sincronização automática de NFe pendentes');

    try {
      // Buscar NFe com status PENDENTE
      const nfesPendentes = await this.nfeRepository.find({
        where: {
          status: NfeStatus.PENDENTE,
          chaveAcesso: Not(''), // Apenas NFe que já foram enviadas para API
        },
        select: ['id', 'companyId', 'chaveAcesso', 'numeroNfe', 'updatedAt'],
      });

      this.logger.log(
        `Encontradas ${nfesPendentes.length} NFe pendentes para sincronização`,
      );

      if (nfesPendentes.length === 0) {
        this.logger.log('Nenhuma NFe pendente encontrada');
        return;
      }

      // Processar cada NFe pendente
      const resultados = await Promise.allSettled(
        nfesPendentes.map((nfe) => this.sincronizarNFeIndividual(nfe)),
      );

      // Contar sucessos e falhas
      const sucessos = resultados.filter(
        (r) => r.status === 'fulfilled',
      ).length;
      const falhas = resultados.filter((r) => r.status === 'rejected').length;

      this.logger.log(
        `Sincronização concluída: ${sucessos} sucessos, ${falhas} falhas`,
      );
    } catch (error) {
      this.logger.error('Erro na sincronização automática:', error);
    }
  }

  /**
   * Sincronizar NFe individual
   */
  private async sincronizarNFeIndividual(nfe: Partial<Nfe>): Promise<void> {
    try {
      this.logger.debug(`Sincronizando NFe ${nfe.id} (${nfe.numeroNfe})`);

      if (!nfe.id) {
        throw new Error('ID da NFe não encontrado');
      }

      await this.nfeIntegrationService.sincronizarStatusNFe(nfe.id);

      this.logger.debug(`NFe ${nfe.id} sincronizada com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao sincronizar NFe ${nfe.id}:`, error);

      // Se a NFe está há muito tempo em processamento, marcar como erro
      if (nfe.updatedAt) {
        const tempoProcessamento = Date.now() - nfe.updatedAt.getTime();
        const tempoLimite = 30 * 60 * 1000; // 30 minutos

        if (tempoProcessamento > tempoLimite) {
          this.logger.warn(
            `NFe ${nfe.id} em processamento há mais de 30 minutos, marcando como erro`,
          );

          if (nfe.id) {
            await this.nfeRepository.update(nfe.id, {
              status: NfeStatus.REJEITADA,
            });
          }
        }
      }
    }
  }

  /**
   * Job de limpeza - executa diariamente às 2h da manhã
   */
  @Cron('0 2 * * *')
  async limpezaNFeAntigas() {
    this.logger.log('Iniciando limpeza de NFe antigas');

    try {
      // Buscar NFe rejeitadas há mais de 30 dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const nfesAntigas = await this.nfeRepository.find({
        where: {
          status: NfeStatus.REJEITADA,
          updatedAt: LessThan(dataLimite),
        },
        select: ['id', 'numeroNfe', 'updatedAt'],
      });

      this.logger.log(
        `Encontradas ${nfesAntigas.length} NFe antigas para limpeza`,
      );

      if (nfesAntigas.length > 0) {
        // Aqui você pode implementar a lógica de limpeza
        // Por exemplo, mover para uma tabela de arquivo ou deletar
        this.logger.log(
          `Limpeza de ${nfesAntigas.length} NFe antigas concluída`,
        );
      }
    } catch (error) {
      this.logger.error('Erro na limpeza de NFe antigas:', error);
    }
  }

  /**
   * Job de estatísticas - executa diariamente às 1h da manhã
   */
  @Cron('0 1 * * *')
  async gerarEstatisticas() {
    this.logger.log('Gerando estatísticas de NFe');

    try {
      const hoje = new Date();
      const inicioDia = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate(),
      );
      const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

      // Contar NFe por status do dia
      const estatisticas = await this.nfeRepository
        .createQueryBuilder('nfe')
        .select('nfe.status', 'status')
        .addSelect('COUNT(*)', 'quantidade')
        .where('nfe.createdAt >= :inicioDia', { inicioDia })
        .andWhere('nfe.createdAt < :fimDia', { fimDia })
        .groupBy('nfe.status')
        .getRawMany();

      this.logger.log('Estatísticas do dia:', estatisticas);
    } catch (error) {
      this.logger.error('Erro ao gerar estatísticas:', error);
    }
  }
}
