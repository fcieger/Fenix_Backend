import { IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateAlertaDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  estados?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  municipios?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modalidades?: string[];

  @IsOptional()
  @IsNumber()
  valorMinimo?: number;

  @IsOptional()
  @IsNumber()
  valorMaximo?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cnae?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  palavrasChave?: string[];

  @IsOptional()
  @IsBoolean()
  apenasAbertas?: boolean;

  @IsOptional()
  @IsNumber()
  diasAntesEncerramento?: number;

  @IsOptional()
  @IsBoolean()
  notificarEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  notificarPush?: boolean;

  @IsOptional()
  @IsString()
  frequencia?: string;

  @IsOptional()
  @IsString()
  horarioNotificacao?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}



