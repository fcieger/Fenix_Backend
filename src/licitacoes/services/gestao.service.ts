import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GestaoLicitacao } from '../entities/gestao-licitacao.entity';
import { Licitacao } from '../entities/licitacao.entity';

@Injectable()
export class GestaoService {
  private readonly logger = new Logger(GestaoService.name);

  constructor(
    @InjectRepository(GestaoLicitacao)
    private readonly gestaoRepository: Repository<GestaoLicitacao>,
    @InjectRepository(Licitacao)
    private readonly licitacaoRepository: Repository<Licitacao>,
  ) {}

  /**
   * Favoritar/desfavoritar licitação
   */
  async toggleFavorito(
    licitacaoId: string,
    userId: string,
    companyId: string,
  ): Promise<{ favorito: boolean }> {
    let gestao = await this.gestaoRepository.findOne({
      where: { licitacaoId, userId },
    });

    if (!gestao) {
      // Criar novo registro de gestão
      gestao = this.gestaoRepository.create({
        licitacaoId,
        userId,
        companyId,
        favorito: true,
        timeline: [
          {
            data: new Date(),
            acao: 'Favoritado',
            usuario: userId,
          },
        ],
      });
    } else {
      // Toggle favorito
      gestao.favorito = !gestao.favorito;
      this.adicionarTimeline(gestao, gestao.favorito ? 'Favoritado' : 'Desfavoritado', userId);
    }

    await this.gestaoRepository.save(gestao);
    this.logger.log(`Licitação ${licitacaoId} ${gestao.favorito ? 'favoritada' : 'desfavoritada'} por ${userId}`);

    return { favorito: gestao.favorito };
  }

  /**
   * Manifestar interesse em licitação
   */
  async manifestarInteresse(
    licitacaoId: string,
    userId: string,
    companyId: string,
    anotacoes?: string,
  ): Promise<GestaoLicitacao> {
    let gestao = await this.gestaoRepository.findOne({
      where: { licitacaoId, userId },
    });

    if (!gestao) {
      gestao = this.gestaoRepository.create({
        licitacaoId,
        userId,
        companyId,
        interesseManifestado: true,
        statusInterno: 'analisando',
        anotacoes,
        timeline: [
          {
            data: new Date(),
            acao: 'Interesse manifestado',
            usuario: userId,
            detalhes: anotacoes,
          },
        ],
      });
    } else {
      gestao.interesseManifestado = true;
      gestao.statusInterno = gestao.statusInterno || 'analisando';
      if (anotacoes) {
        gestao.anotacoes = anotacoes;
      }
      this.adicionarTimeline(gestao, 'Interesse manifestado', userId, anotacoes);
    }

    await this.gestaoRepository.save(gestao);
    this.logger.log(`Interesse manifestado em licitação ${licitacaoId} por ${userId}`);

    return gestao;
  }

  /**
   * Atualizar status interno
   */
  async atualizarStatus(
    licitacaoId: string,
    userId: string,
    status: string,
    anotacoes?: string,
  ): Promise<GestaoLicitacao> {
    const gestao = await this.gestaoRepository.findOne({
      where: { licitacaoId, userId },
    });

    if (!gestao) {
      throw new NotFoundException('Gestão não encontrada');
    }

    gestao.statusInterno = status;
    if (anotacoes) {
      gestao.anotacoes = anotacoes;
    }

    this.adicionarTimeline(gestao, `Status alterado para: ${status}`, userId, anotacoes);

    await this.gestaoRepository.save(gestao);
    this.logger.log(`Status da licitação ${licitacaoId} atualizado para ${status}`);

    return gestao;
  }

  /**
   * Registrar resultado da licitação
   */
  async registrarResultado(
    licitacaoId: string,
    userId: string,
    resultado: string,
    valorContratado?: number,
  ): Promise<GestaoLicitacao> {
    const gestao = await this.gestaoRepository.findOne({
      where: { licitacaoId, userId },
    });

    if (!gestao) {
      throw new NotFoundException('Gestão não encontrada');
    }

    gestao.resultado = resultado;
    if (valorContratado !== undefined) {
      gestao.valorContratado = valorContratado;
    }
    gestao.dataResultado = new Date();

    this.adicionarTimeline(
      gestao,
      `Resultado: ${resultado}`,
      userId,
      valorContratado ? `Valor: R$ ${valorContratado}` : undefined,
    );

    await this.gestaoRepository.save(gestao);
    this.logger.log(`Resultado registrado para licitação ${licitacaoId}: ${resultado}`);

    return gestao;
  }

  /**
   * Listar favoritos do usuário
   */
  async listarFavoritos(userId: string): Promise<GestaoLicitacao[]> {
    return this.gestaoRepository.find({
      where: {
        userId,
        favorito: true,
      },
      relations: ['licitacao'],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Listar licitações com interesse
   */
  async listarComInteresse(userId: string): Promise<GestaoLicitacao[]> {
    return this.gestaoRepository.find({
      where: {
        userId,
        interesseManifestado: true,
      },
      relations: ['licitacao'],
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Buscar gestão de uma licitação
   */
  async buscarGestao(
    licitacaoId: string,
    userId: string,
  ): Promise<GestaoLicitacao | null> {
    return this.gestaoRepository.findOne({
      where: { licitacaoId, userId },
      relations: ['licitacao'],
    });
  }

  /**
   * Estatísticas de participação
   */
  async estatisticasParticipacao(userId: string): Promise<{
    totalParticipacoes: number;
    totalVitorias: number;
    totalDerrotas: number;
    taxaSucesso: number;
    valorTotalContratado: number;
  }> {
    const participacoes = await this.gestaoRepository.find({
      where: { userId, interesseManifestado: true },
    });

    const totalParticipacoes = participacoes.length;
    const totalVitorias = participacoes.filter(p => p.resultado === 'vencedor').length;
    const totalDerrotas = participacoes.filter(p => p.resultado === 'perdedor').length;
    const taxaSucesso = totalParticipacoes > 0 ? (totalVitorias / totalParticipacoes) * 100 : 0;
    const valorTotalContratado = participacoes
      .filter(p => p.resultado === 'vencedor' && p.valorContratado)
      .reduce((acc, p) => acc + Number(p.valorContratado), 0);

    return {
      totalParticipacoes,
      totalVitorias,
      totalDerrotas,
      taxaSucesso: Math.round(taxaSucesso),
      valorTotalContratado,
    };
  }

  /**
   * Adicionar evento à timeline
   */
  private adicionarTimeline(
    gestao: GestaoLicitacao,
    acao: string,
    usuario: string,
    detalhes?: string,
  ) {
    if (!gestao.timeline) {
      gestao.timeline = [];
    }

    gestao.timeline.push({
      data: new Date(),
      acao,
      usuario,
      detalhes,
    });
  }
}


