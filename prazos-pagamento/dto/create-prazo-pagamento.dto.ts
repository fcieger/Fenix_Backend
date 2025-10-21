import { IsString, IsEnum, IsObject, IsBoolean, IsOptional, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ParcelaDto {
  @IsNumber()
  @Min(1)
  numero: number;

  @IsNumber()
  @Min(0)
  dias: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentual: number;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class ConfiguracoesDto {
  // Para tipo 'dias'
  @IsOptional()
  @IsNumber()
  @Min(0)
  dias?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentualEntrada?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentualRestante?: number;
  
  // Para tipo 'parcelas'
  @IsOptional()
  @IsNumber()
  @Min(1)
  numeroParcelas?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  intervaloDias?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentualParcelas?: number;
  
  // Para tipo 'personalizado'
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParcelaDto)
  parcelas?: ParcelaDto[];
}

export class CreatePrazoPagamentoDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsEnum(['dias', 'parcelas', 'personalizado'])
  tipo: 'dias' | 'parcelas' | 'personalizado';

  @IsObject()
  @ValidateNested()
  @Type(() => ConfiguracoesDto)
  configuracoes: ConfiguracoesDto;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsBoolean()
  padrao?: boolean;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
