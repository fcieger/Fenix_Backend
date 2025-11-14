import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ComprasGovService {
  private readonly logger = new Logger(ComprasGovService.name);
  private readonly baseUrl = 'https://compras.dados.gov.br/api';

  constructor(private readonly httpService: HttpService) {}

  async buscarLicitacoes(filtros: any): Promise<any[]> {
    try {
      this.logger.log('Buscando licitações no Compras.gov.br');

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/licitacoes/v1/licitacoes.json`, {
          params: {
            limit: filtros.limite || 50,
          },
          timeout: 30000,
        })
      );

      const licitacoes = response.data._embedded?.licitacoes || [];
      
      this.logger.log(`✅ Encontradas ${licitacoes.length} licitações no Compras.gov`);
      
      return this.normalizarDados(licitacoes);
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar licitações do Compras.gov: ${error.message}`);
      return [];
    }
  }

  private normalizarDados(dados: any[]): any[] {
    return dados.map(item => ({
      numeroProcesso: item.numero_compra || item.identificador,
      titulo: item.objeto || '',
      descricao: item.objeto || '',
      orgao: item.uasg?.nome || '',
      orgaoSigla: item.uasg?.codigo,
      modalidade: this.mapearModalidade(item.modalidade_licitacao?.descricao),
      esfera: 'Federal',
      estado: item.uf || 'DF',
      municipio: null,
      valorEstimado: parseFloat(item.valor_estimado || 0),
      dataAbertura: item.data_publicacao ? new Date(item.data_publicacao) : null,
      dataLimite: item.data_abertura_proposta ? new Date(item.data_abertura_proposta) : null,
      status: item.situacao || 'Aberta',
      linkEdital: null,
      linkSistema: item._links?.self?.href,
      cnae: null,
      categorias: [],
      palavrasChave: [],
      fonte: 'Compras.gov.br',
      idExterno: item.identificador,
      dadosOriginais: item,
    }));
  }

  private mapearModalidade(descricao: string): string {
    if (!descricao) return 'Pregão Eletrônico';
    
    if (descricao.toLowerCase().includes('pregão')) {
      return descricao.toLowerCase().includes('eletrônico') 
        ? 'Pregão Eletrônico' 
        : 'Pregão Presencial';
    }
    
    return descricao;
  }
}



