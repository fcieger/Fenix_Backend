import {
  IsUUID,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoEstoque } from '../../shared/enums/pedido-venda.enums';

export class CreatePedidoVendaItemDto {
  @IsUUID()
  @IsOptional()
  produtoId?: string; // Pode ser null para produtos não cadastrados

  @IsUUID()
  naturezaOperacaoId: string;

  @IsString()
  codigo: string;

  @IsString()
  nome: string;

  @IsString()
  unidadeMedida: string;

  @IsNumber()
  @Type(() => Number)
  quantidade: number;

  @IsNumber()
  @Type(() => Number)
  valorUnitario: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  valorDesconto?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  percentualDesconto?: number;

  @IsNumber()
  @Type(() => Number)
  valorTotal: number;

  @IsEnum(TipoEstoque)
  @IsOptional()
  estoque?: TipoEstoque;

  @IsString()
  @IsOptional()
  ncm?: string;

  @IsString()
  @IsOptional()
  cest?: string;

  @IsString()
  @IsOptional()
  numeroOrdem?: string;

  @IsString()
  @IsOptional()
  numeroItem?: string;

  @IsString()
  @IsOptional()
  codigoBeneficioFiscal?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
