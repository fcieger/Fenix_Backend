import { IsOptional, IsNumber, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPrazoPagamentoDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['dias', 'parcelas', 'personalizado'])
  tipo?: 'dias' | 'parcelas' | 'personalizado';

  @IsOptional()
  @Type(() => Boolean)
  ativo?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  padrao?: boolean;
}

















