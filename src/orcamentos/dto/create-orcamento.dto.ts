import { IsUUID, IsOptional, IsEnum, IsDateString, IsString, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusOrcamento } from '../entities/orcamento.entity';

class OrcamentoItemInput {
  @IsOptional() @IsUUID() produtoId?: string;
  @IsUUID() naturezaOperacaoId: string;
  @IsOptional() @IsString() codigo?: string;
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() unidade?: string;
  @IsOptional() @IsString() ncm?: string;
  @IsOptional() @IsString() cest?: string;
  @IsNumber() quantidade: number;
  @IsNumber() precoUnitario: number;
  @IsOptional() @IsNumber() descontoValor?: number;
  @IsOptional() @IsNumber() descontoPercentual?: number;
  @IsOptional() @IsNumber() freteRateado?: number;
  @IsOptional() @IsNumber() seguroRateado?: number;
  @IsOptional() @IsNumber() outrasDespesasRateado?: number;
}

export class CreateOrcamentoDto {
  @IsUUID() companyId: string;

  @IsUUID() clienteId: string;
  @IsOptional() @IsUUID() vendedorId?: string;
  @IsOptional() @IsUUID() transportadoraId?: string;

  @IsOptional() @IsUUID() prazoPagamentoId?: string;
  @IsOptional() @IsUUID() naturezaOperacaoPadraoId?: string;

  @IsOptional() @IsUUID() formaPagamentoId?: string;
  @IsOptional() @IsString() parcelamento?: string;
  @IsOptional() @IsBoolean() consumidorFinal?: boolean;
  @IsOptional() @IsString() indicadorPresenca?: string;
  @IsOptional() @IsUUID() localEstoqueId?: string;
  @IsOptional() @IsString() listaPreco?: string;

  @IsDateString() dataEmissao: string;
  @IsOptional() @IsDateString() dataPrevisaoEntrega?: string;
  @IsOptional() @IsDateString() dataValidade?: string;

  @IsOptional() @IsString() numero?: string;
  @IsOptional() @IsString() serie?: string;
  @IsOptional() @IsString() numeroPedidoCotacao?: string;

  // Frete e despesas
  @IsOptional() @IsString() frete?: string;
  @IsOptional() @IsNumber() valorFrete?: number;
  @IsOptional() @IsNumber() despesas?: number;
  @IsOptional() @IsBoolean() incluirFreteTotal?: boolean;

  // Dados do veículo
  @IsOptional() @IsString() placaVeiculo?: string;
  @IsOptional() @IsString() ufPlaca?: string;
  @IsOptional() @IsString() rntc?: string;

  // Dados de volume e peso
  @IsOptional() @IsNumber() pesoLiquido?: number;
  @IsOptional() @IsNumber() pesoBruto?: number;
  @IsOptional() @IsNumber() volume?: number;
  @IsOptional() @IsString() especie?: string;
  @IsOptional() @IsString() marca?: string;
  @IsOptional() @IsString() numeracao?: string;
  @IsOptional() @IsNumber() quantidadeVolumes?: number;

  @IsOptional() @IsString() observacoes?: string;

  @IsOptional() @IsEnum(StatusOrcamento) status?: StatusOrcamento;

  @IsOptional() @IsString() motivoPerda?: string;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => OrcamentoItemInput)
  itens?: OrcamentoItemInput[];
}


