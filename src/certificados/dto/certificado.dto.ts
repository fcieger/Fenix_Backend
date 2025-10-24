import { IsString, IsEnum, IsOptional, IsDateString, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateCertificadoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  nome: string;

  @IsString()
  @MinLength(14)
  @MaxLength(18)
  cnpj: string;

  @IsDateString()
  validade: string;

  @IsEnum(['A1', 'A3'])
  tipo: 'A1' | 'A3';

  @IsString()
  nomeArquivo: string;

  @IsString()
  caminhoArquivo: string;

  @IsString()
  hashArquivo: string;

  @IsString()
  senhaCriptografada: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsUUID()
  companyId: string;
}

export class UpdateCertificadoDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  nome?: string;

  @IsOptional()
  @IsString()
  @MinLength(14)
  @MaxLength(18)
  cnpj?: string;

  @IsOptional()
  @IsDateString()
  validade?: string;

  @IsOptional()
  @IsEnum(['A1', 'A3'])
  tipo?: 'A1' | 'A3';

  @IsOptional()
  @IsEnum(['ativo', 'expirado', 'inativo'])
  status?: 'ativo' | 'expirado' | 'inativo';

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class CertificadoResponseDto {
  id: string;
  nome: string;
  cnpj: string;
  validade: string;
  tipo: 'A1' | 'A3';
  status: 'ativo' | 'expirado' | 'inativo';
  nomeArquivo: string;
  dataUpload: string;
  ultimaVerificacao: string;
  diasRestantes: number;
  observacoes?: string;
}