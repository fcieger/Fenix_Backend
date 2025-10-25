import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateContaFinanceiraDto {
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsNotEmpty()
  banco_id: string;

  @IsString()
  @IsNotEmpty()
  banco_nome: string;

  @IsString()
  @IsNotEmpty()
  banco_codigo: string;

  @IsString()
  @IsNotEmpty()
  numero_agencia: string;

  @IsString()
  @IsNotEmpty()
  numero_conta: string;

  @IsString()
  @IsNotEmpty()
  tipo_conta: string;

  @IsString()
  @IsNotEmpty()
  tipo_pessoa: string;

  @IsNumber()
  @IsOptional()
  saldo_inicial?: number;

  @IsDateString()
  @IsNotEmpty()
  data_abertura: string;

  @IsString()
  @IsOptional()
  status?: string;
}

