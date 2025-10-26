import { Expose, Type } from 'class-transformer';
import { NfeStatus } from '../enums/nfe-status.enum';
import { TipoOperacao } from '../enums/tipo-operacao.enum';
import { Finalidade } from '../enums/finalidade.enum';
import { Ambiente } from '../enums/ambiente.enum';
import { ModalidadeFrete } from '../enums/modalidade-frete.enum';
import { FormaPagamento } from '../enums/forma-pagamento.enum';
import { MeioPagamento } from '../enums/meio-pagamento.enum';
import { IndicadorPresenca } from '../enums/indicador-presenca.enum';
import { IndicadorIE } from '../enums/indicador-ie.enum';

export class DestinatarioResponseDto {
  @Expose()
  id?: string;

  @Expose()
  tipo: string;

  @Expose()
  cnpjCpf: string;

  @Expose()
  razaoSocial: string;

  @Expose()
  nomeFantasia?: string;

  @Expose()
  ie?: string;

  @Expose()
  im?: string;

  @Expose()
  indicadorIE?: IndicadorIE;

  @Expose()
  logradouro: string;

  @Expose()
  numero: string;

  @Expose()
  complemento?: string;

  @Expose()
  bairro: string;

  @Expose()
  municipio: string;

  @Expose()
  uf: string;

  @Expose()
  cep: string;

  @Expose()
  codigoMunicipio?: string;

  @Expose()
  pais?: string;

  @Expose()
  codigoPais?: string;

  @Expose()
  telefone?: string;

  @Expose()
  email?: string;
}

export class NfeItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  produtoId?: string;

  @Expose()
  numeroItem: number;

  @Expose()
  codigo: string;

  @Expose()
  descricao: string;

  @Expose()
  ncm?: string;

  @Expose()
  cest?: string;

  @Expose()
  cfop: string;

  @Expose()
  unidadeComercial: string;

  @Expose()
  unidadeTributavel: string;

  @Expose()
  quantidade: number;

  @Expose()
  quantidadeTributavel: number;

  @Expose()
  valorUnitario: number;

  @Expose()
  valorUnitarioTributavel: number;

  @Expose()
  valorTotal: number;

  @Expose()
  valorDesconto: number;

  @Expose()
  valorFrete: number;

  @Expose()
  valorSeguro: number;

  @Expose()
  outrasDespesas: number;

  @Expose()
  impostoICMS?: any;

  @Expose()
  impostoIPI?: any;

  @Expose()
  impostoPIS?: any;

  @Expose()
  impostoCOFINS?: any;

  @Expose()
  observacoes?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class NfeDuplicataResponseDto {
  @Expose()
  id: string;

  @Expose()
  numero: string;

  @Expose()
  dataVencimento: Date;

  @Expose()
  valor: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class NfeResponseDto {
  @Expose()
  id: string;

  @Expose()
  companyId: string;

  @Expose()
  numeroNfe: string;

  @Expose()
  serie: string;

  @Expose()
  modelo: string;

  @Expose()
  configuracaoNfeId: string;

  @Expose()
  chaveAcesso?: string;

  @Expose()
  status: NfeStatus;

  @Expose()
  ambiente: Ambiente;

  @Expose()
  tipoOperacao: TipoOperacao;

  @Expose()
  finalidade: Finalidade;

  @Expose()
  naturezaOperacaoId: string;

  @Expose()
  consumidorFinal: boolean;

  @Expose()
  indicadorPresenca: IndicadorPresenca;

  @Expose()
  @Type(() => DestinatarioResponseDto)
  destinatario: DestinatarioResponseDto;

  @Expose()
  dataEmissao: Date;

  @Expose()
  dataSaida?: Date;

  @Expose()
  horaSaida?: string;

  @Expose()
  dataAutorizacao?: Date;

  @Expose()
  valorTotalProdutos: number;

  @Expose()
  baseCalculoICMS: number;

  @Expose()
  valorICMS: number;

  @Expose()
  baseCalculoICMSST: number;

  @Expose()
  valorICMSST: number;

  @Expose()
  valorFrete: number;

  @Expose()
  valorSeguro: number;

  @Expose()
  valorDesconto: number;

  @Expose()
  outrasDespesas: number;

  @Expose()
  valorIPI: number;

  @Expose()
  valorPIS: number;

  @Expose()
  valorCOFINS: number;

  @Expose()
  tributosAproximados: number;

  @Expose()
  valorTotalNota: number;

  @Expose()
  modalidadeFrete?: ModalidadeFrete;

  @Expose()
  incluirFreteTotal: boolean;

  @Expose()
  transportadoraId?: string;

  @Expose()
  transportadoraNome?: string;

  @Expose()
  transportadoraCnpj?: string;

  @Expose()
  transportadoraIE?: string;

  @Expose()
  veiculoPlaca?: string;

  @Expose()
  veiculoUF?: string;

  @Expose()
  volumes?: any[];

  @Expose()
  formaPagamento?: FormaPagamento;

  @Expose()
  meioPagamento?: MeioPagamento;

  @Expose()
  informacoesComplementares?: string;

  @Expose()
  informacoesFisco?: string;

  @Expose()
  numeroPedido?: string;

  @Expose()
  xmlNfe?: string;

  @Expose()
  xmlRetorno?: string;

  @Expose()
  protocoloAutorizacao?: string;

  @Expose()
  @Type(() => NfeItemResponseDto)
  itens: NfeItemResponseDto[];

  @Expose()
  @Type(() => NfeDuplicataResponseDto)
  duplicatas: NfeDuplicataResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
