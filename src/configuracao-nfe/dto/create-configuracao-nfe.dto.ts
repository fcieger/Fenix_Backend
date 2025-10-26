import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEmail,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TipoModeloNfe,
  AmbienteNfe,
} from '../../shared/enums/configuracao-nfe.enums';

export class CreateConfiguracaoNfeDto {
  // Campos Básicos - Obrigatórios
  @IsString()
  descricaoModelo: string;

  @IsEnum(TipoModeloNfe)
  tipoModelo: TipoModeloNfe;

  @IsString()
  modelo: string;

  @IsString()
  serie: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  numeroAtual?: number;

  @IsEnum(AmbienteNfe)
  ambiente: AmbienteNfe;

  // Campos RPS - Opcionais
  @IsString()
  @IsOptional()
  rpsNaturezaOperacao?: string;

  @IsString()
  @IsOptional()
  rpsRegimeTributario?: string;

  @IsString()
  @IsOptional()
  rpsRegimeEspecialTributacao?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  rpsNumeroLoteAtual?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  rpsSerieLoteAtual?: number;

  @IsString()
  @IsOptional()
  rpsLoginPrefeitura?: string;

  @IsString()
  @IsOptional()
  rpsSenhaPrefeitura?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  rpsAliquotaISS?: number;

  @IsBoolean()
  @IsOptional()
  rpsEnviarNotificacaoCliente?: boolean;

  @IsBoolean()
  @IsOptional()
  rpsReceberNotificacao?: boolean;

  @IsEmail()
  @IsOptional()
  rpsEmailNotificacao?: string;

  // Campos NFC-e - Opcionais
  @IsString()
  @IsOptional()
  nfceIdToken?: string;

  @IsString()
  @IsOptional()
  nfceCscToken?: string;
}
