import { IsUUID, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreatePedidoVendaFromOrcamentoDto {
  @IsUUID() orcamentoId: string;

  @IsOptional() @IsDateString() dataEmissao?: string;
  @IsOptional() @IsDateString() dataPrevisaoEntrega?: string;
  @IsOptional() @IsDateString() dataEntrega?: string;

  @IsOptional() @IsUUID() formaPagamentoId?: string;
  @IsOptional() @IsUUID() prazoPagamentoId?: string;
  @IsOptional() @IsUUID() naturezaOperacaoPadraoId?: string;
  @IsOptional() @IsUUID() localEstoqueId?: string;

  @IsOptional() @IsString() numero?: string;
  @IsOptional() @IsString() serie?: string;
  @IsOptional() @IsString() numeroOrdemCompra?: string;

  @IsOptional() @IsString() observacoes?: string;
}

