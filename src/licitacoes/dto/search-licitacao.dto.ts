import { IsOptional, IsString, IsNumber, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchLicitacaoDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  municipio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modalidades?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  valorMinimo?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  valorMaximo?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  cnae?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  palavrasChave?: string[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dataInicio?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dataFim?: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pagina?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limite?: number;

  @IsOptional()
  @IsString()
  busca?: string;
}



