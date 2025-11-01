import { IsUUID, IsOptional, IsEnum, IsDateString, IsString, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusPedidoVenda } from '../entities/pedido-venda.entity';

class PedidoVendaItemInput {
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
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsNumber() numeroItem?: number;
}

export class CreatePedidoVendaDto {
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
  @IsOptional() @IsDateString() dataEntrega?: string;

  @IsOptional() @IsString() numero?: string;
  @IsOptional() @IsString() serie?: string;
  @IsOptional() @IsString() numeroOrdemCompra?: string;

  @IsOptional() @IsUUID() orcamentoId?: string;

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

  @IsOptional() @IsEnum(StatusPedidoVenda) status?: StatusPedidoVenda;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PedidoVendaItemInput)
  itens?: PedidoVendaItemInput[];
}
