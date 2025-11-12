import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Licitacao } from '../entities/licitacao.entity';

export interface MatchResult {
  licitacaoId: string;
  licitacao: Licitacao;
  score: number;
  motivos: string[];
  produtosRelacionados: string[];
  recomendacao: 'alta' | 'media' | 'baixa';
}

@Injectable()
export class IAMatchService {
  private readonly logger = new Logger(IAMatchService.name);

  constructor(
    @InjectRepository(Licitacao)
    private readonly licitacaoRepository: Repository<Licitacao>,
  ) {}

  /**
   * Calcula match score entre empresa e licitações
   */
  async calcularMatches(companyData: {
    cnae?: string[];
    produtos?: string[];
    historicoVendas?: Array<{ categoria: string; valor: number }>;
    estado?: string;
  }): Promise<MatchResult[]> {
    this.logger.log('Calculando matches automáticos...');

    // Buscar licitações abertas
    const licitacoes = await this.licitacaoRepository.find({
      where: { status: 'Aberta' },
      take: 100,
      order: { dataAbertura: 'DESC' },
    });

    const matches: MatchResult[] = [];

    for (const licitacao of licitacoes) {
      const matchResult = this.calcularScoreLicitacao(licitacao, companyData);
      
      if (matchResult.score > 30) {
        // Apenas matches com score > 30%
        matches.push(matchResult);
      }
    }

    // Ordenar por score decrescente
    matches.sort((a, b) => b.score - a.score);

    this.logger.log(`Encontrados ${matches.length} matches relevantes`);

    return matches.slice(0, 20); // Top 20
  }

  /**
   * Calcula score de match para uma licitação específica
   */
  private calcularScoreLicitacao(
    licitacao: Licitacao,
    companyData: any,
  ): MatchResult {
    let score = 0;
    const motivos: string[] = [];
    const produtosRelacionados: string[] = [];

    // 1. Match por CNAE (peso: 30 pontos)
    if (companyData.cnae && companyData.cnae.length > 0 && licitacao.cnae) {
      const cnaeMatch = companyData.cnae.some((c: string) =>
        licitacao.cnae?.includes(c),
      );
      if (cnaeMatch) {
        score += 30;
        motivos.push('CNAE compatível com sua empresa');
      }
    }

    // 2. Match por palavras-chave dos produtos (peso: 25 pontos)
    if (companyData.produtos && companyData.produtos.length > 0) {
      const produtosMatch = this.compararProdutos(
        licitacao,
        companyData.produtos,
      );
      score += produtosMatch.score;
      if (produtosMatch.score > 0) {
        motivos.push(
          `${produtosMatch.produtos.length} produtos relacionados encontrados`,
        );
        produtosRelacionados.push(...produtosMatch.produtos);
      }
    }

    // 3. Match por localização (peso: 15 pontos)
    if (companyData.estado && licitacao.estado === companyData.estado) {
      score += 15;
      motivos.push('Mesmo estado da sua empresa');
    }

    // 4. Match por valor (peso: 15 pontos)
    if (companyData.historicoVendas && companyData.historicoVendas.length > 0) {
      const valorMedio =
        companyData.historicoVendas.reduce(
          (acc: number, venda: any) => acc + venda.valor,
          0,
        ) / companyData.historicoVendas.length;

      const diferenca = Math.abs(licitacao.valorEstimado - valorMedio);
      const percentualDiferenca = (diferenca / valorMedio) * 100;

      if (percentualDiferenca < 50) {
        score += 15;
        motivos.push('Valor similar ao seu ticket médio');
      } else if (percentualDiferenca < 100) {
        score += 7;
        motivos.push('Valor próximo ao seu ticket médio');
      }
    }

    // 5. Match por categorias (peso: 15 pontos)
    if (licitacao.palavrasChave && licitacao.palavrasChave.length > 0) {
      const categoriasMatch = this.compararCategorias(
        licitacao.palavrasChave,
        companyData.produtos || [],
      );
      score += categoriasMatch;
      if (categoriasMatch > 0) {
        motivos.push('Categorias relevantes identificadas');
      }
    }

    // Determinar recomendação
    let recomendacao: 'alta' | 'media' | 'baixa';
    if (score >= 70) {
      recomendacao = 'alta';
    } else if (score >= 50) {
      recomendacao = 'media';
    } else {
      recomendacao = 'baixa';
    }

    return {
      licitacaoId: licitacao.id,
      licitacao,
      score: Math.min(100, score),
      motivos,
      produtosRelacionados,
      recomendacao,
    };
  }

  /**
   * Compara produtos da empresa com descrição da licitação
   */
  private compararProdutos(
    licitacao: Licitacao,
    produtos: string[],
  ): { score: number; produtos: string[] } {
    const textoLicitacao = `${licitacao.titulo} ${licitacao.descricao}`.toLowerCase();
    const produtosEncontrados: string[] = [];
    let score = 0;

    for (const produto of produtos) {
      const palavrasProduto = produto.toLowerCase().split(' ');
      const matches = palavrasProduto.filter(palavra =>
        textoLicitacao.includes(palavra),
      );

      if (matches.length > 0) {
        produtosEncontrados.push(produto);
        // Mais palavras = maior score
        score += Math.min(5, matches.length * 2);
      }
    }

    return {
      score: Math.min(25, score),
      produtos: produtosEncontrados,
    };
  }

  /**
   * Compara categorias
   */
  private compararCategorias(
    palavrasChaveLicitacao: string[],
    produtosEmpresa: string[],
  ): number {
    const categoriasComuns = palavrasChaveLicitacao.filter(palavra =>
      produtosEmpresa.some(produto =>
        produto.toLowerCase().includes(palavra.toLowerCase()),
      ),
    );

    return Math.min(15, categoriasComuns.length * 3);
  }

  /**
   * Analisa histórico de participações para melhorar recomendações
   */
  async analisarHistorico(companyId: string): Promise<{
    taxaSucesso: number;
    modalidadesFavoritas: string[];
    orgaosMaisContratados: string[];
    valorMedioContratos: number;
  }> {
    // TODO: Buscar dados reais de participações anteriores
    // Por enquanto, retorna dados mockados

    return {
      taxaSucesso: 0.25,
      modalidadesFavoritas: ['Pregão Eletrônico'],
      orgaosMaisContratados: [],
      valorMedioContratos: 0,
    };
  }

  /**
   * Gera insights inteligentes sobre uma licitação
   */
  gerarInsights(match: MatchResult): string[] {
    const insights: string[] = [];

    if (match.score >= 80) {
      insights.push('🎯 Match perfeito! Esta licitação é altamente recomendada para sua empresa.');
    } else if (match.score >= 60) {
      insights.push('✅ Boa oportunidade! Vale a pena avaliar esta licitação.');
    } else if (match.score >= 40) {
      insights.push('⚠️ Oportunidade moderada. Analise os detalhes antes de participar.');
    }

    if (match.produtosRelacionados.length > 3) {
      insights.push(`📦 Você tem ${match.produtosRelacionados.length} produtos que podem atender esta licitação.`);
    }

    const diasRestantes = match.licitacao.dataLimite
      ? Math.ceil(
          (new Date(match.licitacao.dataLimite).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    if (diasRestantes !== null) {
      if (diasRestantes <= 3) {
        insights.push(`⏰ Urgente! Apenas ${diasRestantes} dias para o encerramento.`);
      } else if (diasRestantes <= 7) {
        insights.push(`📅 Prazo curto: ${diasRestantes} dias restantes.`);
      }
    }

    return insights;
  }
}


