import { IsString, IsUUID, IsDate, IsEnum, IsBoolean, IsOptional, IsArray, ValidateNested, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoOperacao } from '../enums/tipo-operacao.enum';
import { Finalidade } from '../enums/finalidade.enum';
import { IndicadorPresenca } from '../enums/indicador-presenca.enum';
import { IndicadorIE } from '../enums/indicador-ie.enum';
import { ModalidadeFrete } from '../enums/modalidade-frete.enum';
import { FormaPagamento } from '../enums/forma-pagamento.enum';
import { MeioPagamento } from '../enums/meio-pagamento.enum';

export class DestinatarioDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  tipo: string; // F=CPF, J=CNPJ

  @IsString()
  cnpjCpf: string;

  @IsString()
  razaoSocial: string;

  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @IsOptional()
  @IsString()
  ie?: string;

  @IsOptional()
  @IsString()
  im?: string;

  @IsOptional()
  @IsEnum(IndicadorIE)
  indicadorIE?: IndicadorIE;

  // Endereço
  @IsString()
  logradouro: string;

  @IsString()
  numero: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsString()
  bairro: string;

  @IsString()
  municipio: string;

  @IsString()
  uf: string;

  @IsString()
  cep: string;

  @IsOptional()
  @IsString()
  codigoMunicipio?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  codigoPais?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class NfeItemDto {
  @IsOptional()
  @IsUUID()
  produtoId?: string;

  @IsString()
  codigo: string;

  @IsString()
  descricao: string;

  @IsOptional()
  @IsString()
  ncm?: string;

  @IsOptional()
  @IsString()
  cest?: string;

  @IsString()
  cfop: string;

  @IsString()
  unidadeComercial: string;

  @IsString()
  unidadeTributavel: string;

  @IsNumber()
  quantidade: number;

  @IsNumber()
  quantidadeTributavel: number;

  @IsNumber()
  valorUnitario: number;

  @IsNumber()
  valorUnitarioTributavel: number;

  @IsNumber()
  valorTotal: number;

  @IsOptional()
  @IsNumber()
  valorDesconto?: number;

  @IsOptional()
  @IsNumber()
  valorFrete?: number;

  @IsOptional()
  @IsNumber()
  valorSeguro?: number;

  @IsOptional()
  @IsNumber()
  outrasDespesas?: number;

  @IsOptional()
  @IsObject()
  impostoICMS?: any;

  @IsOptional()
  @IsObject()
  impostoIPI?: any;

  @IsOptional()
  @IsObject()
  impostoPIS?: any;

  @IsOptional()
  @IsObject()
  impostoCOFINS?: any;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class TotaisNfeDto {
  @IsOptional()
  @IsNumber()
  valorTotalProdutos?: number;

  @IsOptional()
  @IsNumber()
  baseCalculoICMS?: number;

  @IsOptional()
  @IsNumber()
  valorICMS?: number;

  @IsOptional()
  @IsNumber()
  baseCalculoICMSST?: number;

  @IsOptional()
  @IsNumber()
  valorICMSST?: number;

  @IsOptional()
  @IsNumber()
  valorFrete?: number;

  @IsOptional()
  @IsNumber()
  valorSeguro?: number;

  @IsOptional()
  @IsNumber()
  valorDesconto?: number;

  @IsOptional()
  @IsNumber()
  outrasDespesas?: number;

  @IsOptional()
  @IsNumber()
  valorIPI?: number;

  @IsOptional()
  @IsNumber()
  valorPIS?: number;

  @IsOptional()
  @IsNumber()
  valorCOFINS?: number;

  @IsOptional()
  @IsNumber()
  tributosAproximados?: number;

  @IsOptional()
  @IsNumber()
  valorTotalNota?: number;
}

export class TransporteDto {
  @IsOptional()
  @IsEnum(ModalidadeFrete)
  modalidadeFrete?: ModalidadeFrete;

  @IsOptional()
  @IsBoolean()
  incluirFreteTotal?: boolean;

  @IsOptional()
  @IsUUID()
  transportadoraId?: string;

  @IsOptional()
  @IsString()
  transportadoraNome?: string;

  @IsOptional()
  @IsString()
  transportadoraCnpj?: string;

  @IsOptional()
  @IsString()
  transportadoraIE?: string;

  @IsOptional()
  @IsString()
  veiculoPlaca?: string;

  @IsOptional()
  @IsString()
  veiculoUF?: string;

  @IsOptional()
  @IsArray()
  volumes?: any[];
}

export class PagamentoDto {
  @IsOptional()
  @IsEnum(FormaPagamento)
  formaPagamento?: FormaPagamento;

  @IsOptional()
  @IsEnum(MeioPagamento)
  meioPagamento?: MeioPagamento;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DuplicataDto)
  duplicatas?: DuplicataDto[];
}

export class DuplicataDto {
  @IsString()
  numero: string;

  @IsDate()
  @Type(() => Date)
  dataVencimento: Date;

  @IsNumber()
  valor: number;
}

export class CreateNfeDto {
  // Dados gerais
  @IsUUID()
  configuracaoNfeId: string;

  @IsUUID()
  naturezaOperacaoId: string;

  @IsDate()
  @Type(() => Date)
  dataEmissao: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dataSaida?: Date;

  @IsOptional()
  @IsString()
  horaSaida?: string;

  @IsEnum(TipoOperacao)
  tipoOperacao: TipoOperacao;

  @IsEnum(Finalidade)
  finalidade: Finalidade;

  @IsBoolean()
  consumidorFinal: boolean;

  @IsEnum(IndicadorPresenca)
  indicadorPresenca: IndicadorPresenca;

  // Destinatário (estrutura achatada)
  @IsOptional()
  @IsUUID()
  destinatarioId?: string;

  @IsString()
  destinatarioTipo: string;

  @IsString()
  destinatarioCnpjCpf: string;

  @IsString()
  destinatarioRazaoSocial: string;

  @IsOptional()
  @IsString()
  destinatarioNomeFantasia?: string;

  @IsOptional()
  @IsString()
  destinatarioIE?: string;

  @IsOptional()
  @IsString()
  destinatarioIM?: string;

  @IsOptional()
  @IsEnum(IndicadorIE, { message: 'destinatarioIndicadorIE must be one of the following values: CONTRIBUINTE_ICMS, CONTRIBUINTE_ISENTO, NAO_CONTRIBUINTE' })
  destinatarioIndicadorIE?: IndicadorIE;

  @IsString()
  destinatarioLogradouro: string;

  @IsString()
  destinatarioNumero: string;

  @IsOptional()
  @IsString()
  destinatarioComplemento?: string;

  @IsString()
  destinatarioBairro: string;

  @IsString()
  destinatarioMunicipio: string;

  @IsString()
  destinatarioUF: string;

  @IsString()
  destinatarioCEP: string;

  @IsOptional()
  @IsString()
  destinatarioCodigoMunicipio?: string;

  @IsOptional()
  @IsString()
  destinatarioPais?: string;

  @IsOptional()
  @IsString()
  destinatarioCodigoPais?: string;

  @IsOptional()
  @IsString()
  destinatarioTelefone?: string;

  @IsOptional()
  @IsString()
  destinatarioEmail?: string;

  // Itens
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NfeItemDto)
  itens: NfeItemDto[];

  // Totais (podem ser calculados ou informados)
  @IsOptional()
  @ValidateNested()
  @Type(() => TotaisNfeDto)
  totais?: TotaisNfeDto;

  // Transporte (estrutura achatada)
  @IsOptional()
  @IsEnum(ModalidadeFrete)
  modalidadeFrete?: ModalidadeFrete;

  @IsOptional()
  @IsBoolean()
  incluirFreteTotal?: boolean;

  @IsOptional()
  @IsUUID()
  transportadoraId?: string;

  @IsOptional()
  @IsString()
  transportadoraNome?: string;

  @IsOptional()
  @IsString()
  transportadoraCnpj?: string;

  @IsOptional()
  @IsString()
  transportadoraIE?: string;

  @IsOptional()
  @IsString()
  veiculoPlaca?: string;

  @IsOptional()
  @IsString()
  veiculoUF?: string;

  @IsOptional()
  @IsArray()
  volumes?: any[];

  // Pagamento (estrutura achatada)
  @IsOptional()
  @IsEnum(FormaPagamento)
  formaPagamento?: FormaPagamento;

  @IsOptional()
  @IsEnum(MeioPagamento)
  meioPagamento?: MeioPagamento;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DuplicataDto)
  duplicatas?: DuplicataDto[];

  // Informações adicionais
  @IsOptional()
  @IsString()
  informacoesComplementares?: string;

  @IsOptional()
  @IsString()
  informacoesFisco?: string;

  @IsOptional()
  @IsString()
  numeroPedido?: string;
}
