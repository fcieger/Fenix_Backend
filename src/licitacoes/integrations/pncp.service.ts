import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface FiltrosPNCP {
  estado?: string;
  municipio?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  dataInicio?: string;
  dataFim?: string;
  modalidade?: string;
  status?: string;
  pagina?: number;
  limite?: number;
}

@Injectable()
export class PncpService {
  private readonly logger = new Logger(PncpService.name);
  private readonly baseUrl = 'https://pncp.gov.br/api/v1';

  constructor(private readonly httpService: HttpService) {}

  async buscarLicitacoes(filtros: FiltrosPNCP): Promise<any[]> {
    try {
      const params = this.construirParams(filtros);
      
      this.logger.log(`Buscando licitações no PNCP com filtros: ${JSON.stringify(filtros)}`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes`, {
          params,
          timeout: 30000,
        })
      );

      const licitacoes = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];

      this.logger.log(`✅ Encontradas ${licitacoes.length} licitações no PNCP`);
      
      return this.normalizarDados(licitacoes);
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar licitações do PNCP: ${error.message}`);
      
      if (error.response?.status === 404) {
        this.logger.warn('Nenhuma licitação encontrada com os filtros fornecidos');
        return [];
      }
      
      throw error;
    }
  }

  async buscarDetalhes(id: string): Promise<any> {
    try {
      this.logger.log(`Buscando detalhes da licitação ${id} no PNCP`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes/${id}`, {
          timeout: 30000,
        })
      );

      return this.normalizarLicitacao(response.data);
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar detalhes da licitação ${id}: ${error.message}`);
      throw error;
    }
  }

  private construirParams(filtros: FiltrosPNCP): any {
    const params: any = {
      pagina: filtros.pagina || 1,
      limite: filtros.limite || 50,
    };

    if (filtros.estado) params.uf = filtros.estado;
    if (filtros.municipio) params.municipio = filtros.municipio;
    if (filtros.valorMinimo) params.valor_minimo = filtros.valorMinimo;
    if (filtros.valorMaximo) params.valor_maximo = filtros.valorMaximo;
    if (filtros.dataInicio) params.data_publicacao_inicio = filtros.dataInicio;
    if (filtros.dataFim) params.data_publicacao_fim = filtros.dataFim;
    if (filtros.modalidade) params.modalidade_licitacao = filtros.modalidade;
    if (filtros.status) params.situacao = filtros.status;

    return params;
  }

  private normalizarDados(dados: any[]): any[] {
    return dados.map(item => this.normalizarLicitacao(item));
  }

  private normalizarLicitacao(item: any): any {
    const palavrasChave = this.extrairPalavrasChave(
      `${item.objetoCompra || ''} ${item.informacaoComplementar || ''}`
    );

    return {
      numeroProcesso: item.numeroControlePNCP || item.numero,
      titulo: item.objetoCompra || item.titulo,
      descricao: item.informacaoComplementar || item.objetoCompra || '',
      orgao: item.orgaoEntidade?.razaoSocial || item.orgao,
      orgaoSigla: item.orgaoEntidade?.sigla,
      modalidade: this.mapearModalidade(item.modalidadeNome || item.modalidade),
      esfera: this.identificarEsfera(item),
      estado: item.ufSigla || item.uf,
      municipio: item.municipio?.nome || item.municipio,
      valorEstimado: parseFloat(item.valorTotalEstimado || item.valor || 0),
      dataAbertura: this.parseData(item.dataPublicacaoPncp || item.dataPublicacao),
      dataLimite: this.parseData(item.dataAberturaPropostaNova || item.dataEncerramento),
      status: this.mapearStatus(item.situacaoCompra || item.situacao),
      linkEdital: item.linkSistemaOrigem || item.urlEdital,
      linkSistema: item.linkSistemaOrigem,
      cnae: item.cnae,
      categorias: item.itensCompra?.map((i: any) => i.itemCategoria) || [],
      palavrasChave,
      fonte: 'PNCP',
      idExterno: item.numeroControlePNCP || item.sequencialCompra,
      dadosOriginais: item,
      contato: item.contato?.nome,
      email: item.contato?.email,
      telefone: item.contato?.telefone,
    };
  }

  private mapearModalidade(modalidade: string): string {
    const mapa: Record<string, string> = {
      'Pregão Eletrônico': 'Pregão Eletrônico',
      'Pregão Presencial': 'Pregão Presencial',
      'Concorrência': 'Concorrência',
      'Tomada de Preços': 'Tomada de Preços',
      'Convite': 'Convite',
      'Dispensa de Licitação': 'Dispensa de Licitação',
      'Inexigibilidade': 'Inexigibilidade',
    };

    return mapa[modalidade] || modalidade;
  }

  private mapearStatus(status: string): string {
    const mapa: Record<string, string> = {
      'Em andamento': 'Aberta',
      'Aberta': 'Aberta',
      'Encerrada': 'Encerrada',
      'Homologada': 'Homologada',
      'Cancelada': 'Cancelada',
      'Deserta': 'Deserta',
      'Fracassada': 'Fracassada',
    };

    return mapa[status] || 'Aberta';
  }

  private identificarEsfera(item: any): string {
    const orgao = item.orgaoEntidade?.razaoSocial?.toLowerCase() || '';
    
    if (orgao.includes('federal') || orgao.includes('união') || orgao.includes('ministério')) {
      return 'Federal';
    }
    
    if (orgao.includes('estado') || orgao.includes('estadual') || orgao.includes('governo do')) {
      return 'Estadual';
    }
    
    return 'Municipal';
  }

  private parseData(data: string): Date | null {
    if (!data) return null;
    
    try {
      return new Date(data);
    } catch {
      return null;
    }
  }

  private extrairPalavrasChave(texto: string): string[] {
    if (!texto) return [];

    const limpo = texto
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');

    const stopWords = new Set([
      'o', 'a', 'de', 'da', 'do', 'para', 'com', 'em', 'e', 'os', 'as',
      'dos', 'das', 'um', 'uma', 'por', 'na', 'no', 'ao', 'à', 'que',
    ]);

    const palavras = limpo
      .split(' ')
      .filter(p => p.length > 3 && !stopWords.has(p));

    const frequencia = new Map<string, number>();
    palavras.forEach(p => {
      frequencia.set(p, (frequencia.get(p) || 0) + 1);
    });

    return Array.from(frequencia.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([palavra]) => palavra);
  }
}



