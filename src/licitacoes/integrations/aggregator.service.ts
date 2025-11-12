import { Injectable, Logger } from '@nestjs/common';
import { PncpService } from './pncp.service';
import { ComprasGovService } from './compras-gov.service';

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(
    private readonly pncpService: PncpService,
    private readonly comprasGovService: ComprasGovService,
  ) {}

  async buscarTodasLicitacoes(filtros: any): Promise<any[]> {
    this.logger.log('Agregando licitações de múltiplas fontes');

    const promises = [
      this.pncpService.buscarLicitacoes(filtros).catch(err => {
        this.logger.error(`Erro ao buscar do PNCP: ${err.message}`);
        return [];
      }),
      this.comprasGovService.buscarLicitacoes(filtros).catch(err => {
        this.logger.error(`Erro ao buscar do Compras.gov: ${err.message}`);
        return [];
      }),
    ];

    const resultados = await Promise.all(promises);
    const todas = resultados.flat();

    this.logger.log(`Total agregado: ${todas.length} licitações`);

    return this.deduplicar(todas);
  }

  private deduplicar(licitacoes: any[]): any[] {
    const mapa = new Map<string, any>();

    for (const lic of licitacoes) {
      const chave = `${lic.numeroProcesso}-${lic.orgao}`;
      
      if (!mapa.has(chave) || mapa.get(chave).fonte === 'Compras.gov.br') {
        mapa.set(chave, lic);
      }
    }

    const unicas = Array.from(mapa.values());
    this.logger.log(`Após deduplicação: ${unicas.length} licitações únicas`);

    return unicas;
  }
}


