import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Nfe } from '../nfe/entities/nfe.entity';
import { NfeService } from '../nfe/nfe.service';
import { ConfiguracaoNfeService } from '../configuracao-nfe/configuracao-nfe.service';
import { NFE_API_CONFIG, NFE_API_ENDPOINTS } from '../config/nfe-api.config';
import {
  NFeApiRequest,
  NFeApiResponse,
  WebhookNFeData,
  EmitenteRequest,
  DestinatarioRequest,
  ItemRequest,
  TransporteRequest,
  CobrancaRequest,
  InformacoesAdicionaisRequest,
  EnderecoRequest,
  ContatoRequest,
} from './interfaces/nfe-api.interface';
import { NfeStatus } from '../nfe/enums/nfe-status.enum';
import { Ambiente } from '../nfe/enums/ambiente.enum';
import { TipoOperacao } from '../nfe/enums/tipo-operacao.enum';
import { Finalidade } from '../nfe/enums/finalidade.enum';
import { FormaPagamento } from '../nfe/enums/forma-pagamento.enum';
import { ModalidadeFrete } from '../nfe/enums/modalidade-frete.enum';
import { IndicadorPresenca } from '../nfe/enums/indicador-presenca.enum';

@Injectable()
export class NFeIntegrationService {
  private readonly logger = new Logger(NFeIntegrationService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Nfe)
    private readonly nfeRepository: Repository<Nfe>,
    private readonly nfeService: NfeService,
    private readonly configuracaoNfeService: ConfiguracaoNfeService,
  ) {}

  /**
   * Emitir NFe via API externa
   */
  async emitirNFe(nfeId: string, companyId: string): Promise<NFeApiResponse> {
    this.logger.log(
      `Iniciando emissão da NFe ${nfeId} para empresa ${companyId}`,
    );

    try {
      // 1. Buscar NFe no FENIX
      const nfe = await this.nfeRepository.findOne({
        where: { id: nfeId, companyId },
        relations: ['itens', 'duplicatas'],
      });
      if (!nfe) {
        throw new NotFoundException('NFe não encontrada');
      }

      // 2. Verificar se NFe pode ser emitida
      if (nfe.status !== NfeStatus.RASCUNHO) {
        throw new BadRequestException(
          'NFe deve estar em rascunho para ser emitida',
        );
      }

      // 3. Validar dados antes do envio
      await this.validarNFeAntesEnvio(nfe);

      // 4. Mapear dados do FENIX para API NFe
      const nfeRequest = await this.mapearNFeParaApiExterna(nfe);

      // 5. Chamar API NFe externa com retry
      const response = await this.chamarApiNFeComRetry(
        NFE_API_ENDPOINTS.EMITIR,
        nfeRequest,
        companyId,
      );

      // 6. Atualizar NFe no FENIX com dados da API
      await this.atualizarNFeComRespostaApi(nfeId, response);

      this.logger.log(`NFe ${nfeId} enviada com sucesso para API externa`);
      return response;
    } catch (error) {
      this.logger.error(`Erro ao emitir NFe ${nfeId}:`, error);
      throw error;
    }
  }

  /**
   * Validar NFe antes do envio para API externa
   */
  private async validarNFeAntesEnvio(nfe: Nfe): Promise<void> {
    this.logger.log(`Validando NFe ${nfe.id} antes do envio`);

    // Validar dados obrigatórios
    if (!nfe.destinatarioCnpjCpf) {
      throw new BadRequestException('CNPJ/CPF do destinatário é obrigatório');
    }

    if (!nfe.destinatarioRazaoSocial) {
      throw new BadRequestException(
        'Razão social do destinatário é obrigatória',
      );
    }

    if (!nfe.destinatarioUF) {
      throw new BadRequestException('UF do destinatário é obrigatória');
    }

    if (!nfe.itens || nfe.itens.length === 0) {
      throw new BadRequestException('NFe deve ter pelo menos um item');
    }

    // Validar itens
    for (const [index, item] of nfe.itens.entries()) {
      if (!item.descricao) {
        throw new BadRequestException(
          `Item ${index + 1}: Descrição é obrigatória`,
        );
      }
      if (!item.quantidade || item.quantidade <= 0) {
        throw new BadRequestException(
          `Item ${index + 1}: Quantidade deve ser maior que zero`,
        );
      }
      if (!item.valorUnitario || item.valorUnitario <= 0) {
        throw new BadRequestException(
          `Item ${index + 1}: Valor unitário deve ser maior que zero`,
        );
      }
    }

    // Validar configuração NFe
    if (!nfe.configuracaoNfeId) {
      throw new BadRequestException('Configuração NFe é obrigatória');
    }

    this.logger.log(`NFe ${nfe.id} validada com sucesso`);
  }

  /**
   * Chamar API NFe com retry automático
   */
  private async chamarApiNFeComRetry(
    endpoint: string,
    data: any,
    companyId: string,
    maxRetries: number = 3,
  ): Promise<NFeApiResponse> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `Tentativa ${attempt}/${maxRetries} para endpoint ${endpoint}`,
        );
        return await this.chamarApiNFe(endpoint, data, companyId);
      } catch (error) {
        this.logger.warn(`Tentativa ${attempt} falhou:`, error.message);

        if (attempt === maxRetries) {
          this.logger.error(`Todas as ${maxRetries} tentativas falharam`);
          throw error;
        }

        // Backoff exponencial: 1s, 2s, 4s
        const delay = 1000 * Math.pow(2, attempt - 1);
        this.logger.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    throw new Error('Todas as tentativas de chamada à API NFe falharam');
  }

  /**
   * Mapear dados do FENIX para formato da API NFe
   */
  private async mapearNFeParaApiExterna(nfe: Nfe): Promise<NFeApiRequest> {
    // Buscar configuração NFe para dados do emitente
    const configuracao =
      await this.configuracaoNfeService.findOneWithCredentials(
        nfe.configuracaoNfeId,
        nfe.companyId,
      );

    return {
      empresaId: nfe.companyId,
      numeroNfe: parseInt(nfe.numeroNfe),
      serie: parseInt(nfe.serie),
      ambiente: this.mapearAmbiente(nfe.ambiente),
      estado: nfe.destinatarioUF,
      priority: 'NORMAL',
      naturezaOperacao: nfe.naturezaOperacaoId,
      dataEmissao: nfe.dataEmissao.toISOString(),
      dataSaidaEntrada: (nfe.dataSaida || nfe.dataEmissao).toISOString(),
      tipoNfe: nfe.tipoOperacao === TipoOperacao.SAIDA ? 0 : 1,
      formaPagamento: this.mapearFormaPagamento(nfe.formaPagamento),
      formaEmissao: 1, // Normal
      finalidade: this.mapearFinalidade(nfe.finalidade),
      consumidorFinal: nfe.consumidorFinal,
      presenca: this.mapearPresenca(nfe.indicadorPresenca),

      // Emitente (dados da empresa)
      emitente: await this.obterDadosEmitente(configuracao),

      // Destinatário
      destinatario: this.mapearDestinatario(nfe),

      // Itens
      itens: this.mapearItens(nfe.itens || []),

      // Transporte
      transporte: nfe.modalidadeFrete ? this.mapearTransporte(nfe) : undefined,

      // Cobrança
      cobranca:
        nfe.duplicatas && nfe.duplicatas.length > 0
          ? this.mapearCobranca(nfe)
          : undefined,

      // Informações adicionais
      informacoesAdicionais:
        nfe.informacoesComplementares || nfe.informacoesFisco
          ? {
              informacoesAdicionais: nfe.informacoesComplementares,
              informacoesComplementares: nfe.informacoesFisco,
            }
          : undefined,

      observacoes: nfe.numeroPedido,
    };
  }

  /**
   * Obter dados do emitente da configuração NFe
   */
  private async obterDadosEmitente(
    configuracao: any,
  ): Promise<EmitenteRequest> {
    return {
      cnpj: configuracao.cnpj,
      nome: configuracao.razaoSocial,
      fantasia: configuracao.nomeFantasia,
      ie: configuracao.inscricaoEstadual,
      im: configuracao.inscricaoMunicipal,
      endereco: {
        logradouro: configuracao.endereco?.logradouro || '',
        numero: configuracao.endereco?.numero || '',
        complemento: configuracao.endereco?.complemento,
        bairro: configuracao.endereco?.bairro || '',
        codigoMunicipio: configuracao.endereco?.codigoMunicipio || '',
        nomeMunicipio: configuracao.endereco?.municipio || '',
        uf: configuracao.endereco?.uf || '',
        cep: configuracao.endereco?.cep || '',
        codigoPais: configuracao.endereco?.codigoPais || '1058',
        nomePais: configuracao.endereco?.pais || 'Brasil',
        telefone: configuracao.telefone,
      },
      contato: {
        telefone: configuracao.telefone,
        email: configuracao.email,
      },
    };
  }

  /**
   * Mapear destinatário
   */
  private mapearDestinatario(nfe: Nfe): DestinatarioRequest {
    return {
      cnpjCpf: nfe.destinatarioCnpjCpf,
      nome: nfe.destinatarioRazaoSocial,
      endereco: {
        logradouro: nfe.destinatarioLogradouro,
        numero: nfe.destinatarioNumero,
        complemento: nfe.destinatarioComplemento,
        bairro: nfe.destinatarioBairro,
        codigoMunicipio: nfe.destinatarioCodigoMunicipio || '',
        nomeMunicipio: nfe.destinatarioMunicipio,
        uf: nfe.destinatarioUF,
        cep: nfe.destinatarioCEP,
        codigoPais: nfe.destinatarioCodigoPais,
        nomePais: nfe.destinatarioPais,
        telefone: nfe.destinatarioTelefone,
      },
      ie: nfe.destinatarioIE,
      email: nfe.destinatarioEmail,
    };
  }

  /**
   * Mapear itens da NFe
   */
  private mapearItens(itens: any[]): ItemRequest[] {
    return itens.map((item, index) => ({
      numeroItem: index + 1,
      codigoProduto: item.codigo || '',
      descricaoProduto: item.descricao,
      ncm: item.ncm || '',
      cfop: item.cfop || '',
      unidadeComercial: item.unidadeComercial || 'UN',
      quantidadeComercial: item.quantidade,
      valorUnitarioComercial: item.valorUnitario,
      valorTotalProduto: item.valorTotal,
      unidadeTributavel:
        item.unidadeTributavel || item.unidadeComercial || 'UN',
      quantidadeTributavel: item.quantidadeTributavel || item.quantidade,
      valorUnitarioTributavel:
        item.valorUnitarioTributavel || item.valorUnitario,
      indicadorTotal: 1,
    }));
  }

  /**
   * Mapear transporte
   */
  private mapearTransporte(nfe: Nfe): TransporteRequest {
    const transporte: TransporteRequest = {
      modalidadeFrete: this.mapearModalidadeFrete(nfe.modalidadeFrete),
    };

    if (nfe.transportadoraNome) {
      transporte.transportadora = {
        cnpjCpf: nfe.transportadoraCnpj || '',
        nome: nfe.transportadoraNome,
        ie: nfe.transportadoraIE,
        endereco: {
          logradouro: '', // TODO: Buscar endereço da transportadora
          numero: '',
          bairro: '',
          codigoMunicipio: '',
          nomeMunicipio: '',
          uf: '',
          cep: '',
          codigoPais: '1058',
          nomePais: 'Brasil',
        },
      };
    }

    if (nfe.veiculoPlaca) {
      transporte.veiculo = {
        placa: nfe.veiculoPlaca,
        uf: nfe.veiculoUF || '',
        rntc: undefined, // Campo não existe na entidade Nfe
      };
    }

    return transporte;
  }

  /**
   * Mapear cobrança
   */
  private mapearCobranca(nfe: Nfe): CobrancaRequest {
    const duplicata = nfe.duplicatas[0];
    return {
      duplicata: {
        numero: duplicata.numero,
        dataVencimento: duplicata.dataVencimento.toISOString().split('T')[0],
        valor: duplicata.valor,
      },
    };
  }

  /**
   * Sincronizar status de NFe
   */
  async sincronizarStatusNFe(nfeId: string): Promise<void> {
    this.logger.log(`Sincronizando status da NFe ${nfeId}`);

    try {
      const nfe = await this.nfeRepository.findOne({
        where: { id: nfeId },
        relations: ['itens', 'duplicatas'],
      });

      if (!nfe || !nfe.chaveAcesso) {
        this.logger.warn(
          `NFe ${nfeId} não encontrada ou não possui chave de acesso`,
        );
        return;
      }

      const response = await this.chamarApiNFe(
        `${NFE_API_ENDPOINTS.STATUS}/${nfe.chaveAcesso}`,
        null,
        nfe.companyId,
        'GET',
      );

      await this.atualizarStatusNFe(nfeId, response);
      this.logger.log(`Status da NFe ${nfeId} sincronizado com sucesso`);
    } catch (error) {
      this.logger.error(`Erro ao sincronizar NFe ${nfeId}:`, error);
      throw error;
    }
  }

  /**
   * Cancelar NFe via API externa
   */
  async cancelarNFe(
    nfeId: string,
    justificativa: string,
    companyId: string,
  ): Promise<{ message: string; status: string }> {
    this.logger.log(`Cancelando NFe ${nfeId} para empresa ${companyId}`);

    try {
      // Buscar NFe no FENIX
      const nfe = await this.nfeRepository.findOne({
        where: { id: nfeId, companyId },
      });

      if (!nfe) {
        throw new NotFoundException('NFe não encontrada');
      }

      if (!nfe.chaveAcesso) {
        throw new BadRequestException(
          'NFe não possui chave de acesso para cancelamento',
        );
      }

      if (nfe.status !== NfeStatus.AUTORIZADA) {
        throw new BadRequestException(
          'Apenas NFes autorizadas podem ser canceladas',
        );
      }

      // Validar justificativa
      if (!justificativa || justificativa.trim().length < 15) {
        throw new BadRequestException(
          'Justificativa deve ter pelo menos 15 caracteres',
        );
      }

      // Chamar API NFe para cancelamento
      const response = await this.chamarApiNFeComRetry(
        `${NFE_API_ENDPOINTS.CANCELAR}/${nfe.chaveAcesso}`,
        { justificativa },
        companyId,
      );

      // Atualizar status da NFe
      await this.nfeRepository.update(nfeId, {
        status: NfeStatus.CANCELADA,
      });

      this.logger.log(`NFe ${nfeId} cancelada com sucesso`);
      return {
        message: 'NFe cancelada com sucesso',
        status: 'CANCELADA',
      };
    } catch (error) {
      this.logger.error(`Erro ao cancelar NFe ${nfeId}:`, error);
      throw error;
    }
  }

  /**
   * Download XML da NFe
   */
  async downloadXML(
    nfeId: string,
    companyId: string,
  ): Promise<{ xml: string; filename: string }> {
    this.logger.log(`Download XML da NFe ${nfeId}`);

    try {
      const nfe = await this.nfeRepository.findOne({
        where: { id: nfeId, companyId },
      });

      if (!nfe) {
        throw new NotFoundException('NFe não encontrada');
      }

      if (!nfe.chaveAcesso) {
        throw new BadRequestException('NFe não possui chave de acesso');
      }

      // Chamar API NFe para download XML
      const response = await this.chamarApiNFeComRetry(
        `${NFE_API_ENDPOINTS.CONSULTAR}/xml/${nfe.chaveAcesso}`,
        null,
        companyId,
      );

      const filename = `NFe_${nfe.chaveAcesso}.xml`;

      this.logger.log(`XML da NFe ${nfeId} baixado com sucesso`);
      return {
        xml: response.xml || response.data,
        filename,
      };
    } catch (error) {
      this.logger.error(`Erro ao baixar XML da NFe ${nfeId}:`, error);
      throw error;
    }
  }

  /**
   * Download PDF da NFe
   */
  async downloadPDF(
    nfeId: string,
    companyId: string,
  ): Promise<{ pdf: string; filename: string }> {
    this.logger.log(`Download PDF da NFe ${nfeId}`);

    try {
      const nfe = await this.nfeRepository.findOne({
        where: { id: nfeId, companyId },
      });

      if (!nfe) {
        throw new NotFoundException('NFe não encontrada');
      }

      if (!nfe.chaveAcesso) {
        throw new BadRequestException('NFe não possui chave de acesso');
      }

      // Chamar API NFe para download PDF
      const response = await this.chamarApiNFeComRetry(
        `${NFE_API_ENDPOINTS.CONSULTAR}/pdf/${nfe.chaveAcesso}`,
        null,
        companyId,
      );

      const filename = `NFe_${nfe.chaveAcesso}.pdf`;

      this.logger.log(`PDF da NFe ${nfeId} baixado com sucesso`);
      return {
        pdf: response.pdf || response.data,
        filename,
      };
    } catch (error) {
      this.logger.error(`Erro ao baixar PDF da NFe ${nfeId}:`, error);
      throw error;
    }
  }

  /**
   * Download DANFE da NFe
   */
  async downloadDANFE(
    nfeId: string,
    companyId: string,
  ): Promise<{ danfe: string; filename: string }> {
    this.logger.log(`Download DANFE da NFe ${nfeId}`);

    try {
      const nfe = await this.nfeRepository.findOne({
        where: { id: nfeId, companyId },
      });

      if (!nfe) {
        throw new NotFoundException('NFe não encontrada');
      }

      if (!nfe.chaveAcesso) {
        throw new BadRequestException('NFe não possui chave de acesso');
      }

      // Chamar API NFe para download DANFE
      const response = await this.chamarApiNFeComRetry(
        `${NFE_API_ENDPOINTS.CONSULTAR}/danfe/${nfe.chaveAcesso}`,
        null,
        companyId,
      );

      const filename = `DANFE_${nfe.chaveAcesso}.pdf`;

      this.logger.log(`DANFE da NFe ${nfeId} baixado com sucesso`);
      return {
        danfe: response.danfe || response.data,
        filename,
      };
    } catch (error) {
      this.logger.error(`Erro ao baixar DANFE da NFe ${nfeId}:`, error);
      throw error;
    }
  }

  /**
   * Consultar NFe por chave de acesso
   */
  async consultarNFe(chaveAcesso: string, companyId: string): Promise<any> {
    this.logger.log(`Consultando NFe com chave ${chaveAcesso}`);

    try {
      const response = await this.chamarApiNFeComRetry(
        `${NFE_API_ENDPOINTS.CONSULTAR}/${chaveAcesso}`,
        null,
        companyId,
      );

      this.logger.log(`NFe ${chaveAcesso} consultada com sucesso`);
      return response;
    } catch (error) {
      this.logger.error(`Erro ao consultar NFe ${chaveAcesso}:`, error);
      throw error;
    }
  }

  /**
   * Webhook para receber atualizações da API NFe
   */
  async receberWebhookNFe(webhookData: WebhookNFeData): Promise<void> {
    this.logger.log(`Recebendo webhook para NFe ${webhookData.nfeId}`);

    try {
      // Buscar NFe no FENIX
      const nfe = await this.nfeRepository.findOne({
        where: { id: webhookData.nfeId },
      });

      if (!nfe) {
        this.logger.warn(
          `NFe ${webhookData.nfeId} não encontrada para webhook`,
        );
        return;
      }

      // Atualizar NFe com dados do webhook
      await this.nfeRepository.update(webhookData.nfeId, {
        status: this.mapearStatusApiParaFenix(webhookData.status),
        chaveAcesso: webhookData.chaveAcesso,
        xmlNfe: webhookData.xmlNfe,
        protocoloAutorizacao: webhookData.protocoloAutorizacao,
        dataAutorizacao: new Date(webhookData.dataAtualizacao),
      });

      this.logger.log(`NFe ${webhookData.nfeId} atualizada via webhook`);
    } catch (error) {
      this.logger.error(
        `Erro ao processar webhook da NFe ${webhookData.nfeId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Chamar API NFe externa
   */
  private async chamarApiNFe(
    endpoint: string,
    data: any,
    companyId: string,
    method: 'GET' | 'POST' = 'POST',
  ): Promise<NFeApiResponse> {
    const url = `${NFE_API_CONFIG.BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Empresa-Id': companyId,
      Authorization: `Bearer ${await this.obterTokenApiNfe()}`,
    };

    try {
      let response;
      if (method === 'GET') {
        response = await firstValueFrom(
          this.httpService.get(url, {
            headers,
            timeout: NFE_API_CONFIG.TIMEOUT,
          }),
        );
      } else {
        response = await firstValueFrom(
          this.httpService.post(url, data, {
            headers,
            timeout: NFE_API_CONFIG.TIMEOUT,
          }),
        );
      }

      return response.data;
    } catch (error) {
      this.logger.error(
        `Erro na chamada para API NFe:`,
        error.response?.data || error.message,
      );
      throw new BadRequestException('Erro na comunicação com API NFe');
    }
  }

  /**
   * Obter token da API NFe com autenticação real
   */
  private async obterTokenApiNfe(): Promise<string> {
    try {
      this.logger.log('Iniciando autenticação com API NFe');

      const authData = {
        username: process.env.NFE_API_USERNAME || 'admin',
        password: process.env.NFE_API_PASSWORD || 'admin123',
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${NFE_API_CONFIG.BASE_URL}/api/auth/login`,
          authData,
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            timeout: NFE_API_CONFIG.TIMEOUT,
          },
        ),
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.accessToken
      ) {
        this.logger.log('Token obtido com sucesso da API NFe');
        return response.data.data.accessToken;
      } else {
        throw new Error('Resposta de autenticação inválida');
      }
    } catch (error) {
      this.logger.error(
        'Erro ao obter token da API NFe:',
        error.response?.data || error.message,
      );

      // Verificar se é erro de conexão (API não disponível)
      if (
        error.code === 'ECONNREFUSED' ||
        error.message?.includes('ECONNREFUSED')
      ) {
        throw new BadRequestException(
          'API NFe não está disponível. Verifique se o serviço está rodando na porta 8080.',
        );
      }

      throw new BadRequestException(
        'Falha na autenticação com API NFe: ' +
          (error.response?.data?.message || error.message),
      );
    }
  }

  /**
   * Atualizar NFe com resposta da API
   */
  private async atualizarNFeComRespostaApi(
    nfeId: string,
    response: NFeApiResponse,
  ): Promise<void> {
    await this.nfeRepository.update(nfeId, {
      status: this.mapearStatusApiParaFenix(response.status),
      chaveAcesso: response.chaveAcesso,
      xmlNfe: response.xmlNfe,
      protocoloAutorizacao: response.protocoloAutorizacao,
      dataAutorizacao: response.dataAutorizacao
        ? new Date(response.dataAutorizacao)
        : undefined,
    });
  }

  /**
   * Atualizar status da NFe
   */
  private async atualizarStatusNFe(
    nfeId: string,
    response: any,
  ): Promise<void> {
    await this.nfeRepository.update(nfeId, {
      status: this.mapearStatusApiParaFenix(response.status),
      xmlNfe: response.xmlNfe,
      protocoloAutorizacao: response.protocoloAutorizacao,
      dataAutorizacao: response.dataAutorizacao
        ? new Date(response.dataAutorizacao)
        : undefined,
    });
  }

  // Mapeadores de enum
  private mapearAmbiente(ambiente: Ambiente): 'HOMOLOGACAO' | 'PRODUCAO' {
    return ambiente === Ambiente.HOMOLOGACAO ? 'HOMOLOGACAO' : 'PRODUCAO';
  }

  private mapearFormaPagamento(formaPagamento: FormaPagamento): number {
    return formaPagamento === FormaPagamento.VISTA ? 0 : 1;
  }

  private mapearFinalidade(finalidade: Finalidade): number {
    const map = {
      [Finalidade.NORMAL]: 1,
      [Finalidade.COMPLEMENTAR]: 2,
      [Finalidade.AJUSTE]: 3,
      [Finalidade.DEVOLUCAO]: 4,
    };
    return map[finalidade] || 1;
  }

  private mapearPresenca(indicadorPresenca: IndicadorPresenca): number {
    const map = {
      [IndicadorPresenca.NAO_SE_APLICA]: 0,
      [IndicadorPresenca.PRESENCIAL]: 1,
      [IndicadorPresenca.INTERNET]: 2,
      [IndicadorPresenca.TELEATENDIMENTO]: 3,
      [IndicadorPresenca.NFCe_ENTREGA_DOMICILIO]: 4,
      [IndicadorPresenca.NFCe_PRESENCIAL_FORA_ESTABELECIMENTO]: 5,
      [IndicadorPresenca.OUTROS]: 9,
    };
    return map[indicadorPresenca] || 0;
  }

  private mapearModalidadeFrete(modalidadeFrete: ModalidadeFrete): number {
    const map = {
      [ModalidadeFrete.SEM_FRETE]: 0,
      [ModalidadeFrete.POR_CONTA_EMITENTE]: 1,
      [ModalidadeFrete.POR_CONTA_DESTINATARIO]: 2,
      [ModalidadeFrete.POR_CONTA_TERCEIROS]: 3,
    };
    return map[modalidadeFrete] || 0;
  }

  private mapearStatusApiParaFenix(status: string): NfeStatus {
    const map = {
      RASCUNHO: NfeStatus.RASCUNHO,
      PROCESSANDO: NfeStatus.PENDENTE,
      AUTORIZADA: NfeStatus.AUTORIZADA,
      REJEITADA: NfeStatus.REJEITADA,
      CANCELADA: NfeStatus.CANCELADA,
    };
    return map[status] || NfeStatus.RASCUNHO;
  }
}
