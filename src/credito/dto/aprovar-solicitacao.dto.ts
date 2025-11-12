import { IsNotEmpty, IsNumber, IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class AprovarSolicitacaoDto {
  @IsOptional()
  @IsInt({ message: 'O score deve ser um número inteiro' })
  @Min(0, { message: 'O score mínimo é 0' })
  @Max(1000, { message: 'O score máximo é 1000' })
  scoreCredito?: number;

  @IsOptional()
  @IsString()
  riscoClassificacao?: string;

  @IsNotEmpty({ message: 'O parecer técnico é obrigatório' })
  @IsString({ message: 'O parecer deve ser um texto' })
  parecerTecnico: string;

  @IsOptional()
  @IsNumber({}, { message: 'O valor aprovado deve ser um número' })
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  valorAprovado?: number;

  @IsOptional()
  @IsNumber({}, { message: 'A taxa de juros deve ser um número' })
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  taxaJuros?: number;

  @IsOptional()
  @IsInt({ message: 'O prazo deve ser um número inteiro' })
  prazoMeses?: number;

  @IsOptional()
  @IsString()
  condicoesEspeciais?: string;

  @IsOptional()
  @IsString()
  garantiasExigidas?: string;
}



