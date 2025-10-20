import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UploadCertificadoDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class SubmitPasswordDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4, { message: 'Senha deve ter pelo menos 4 caracteres' })
  senha: string;
}
