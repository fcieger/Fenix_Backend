import { IsString, IsOptional } from 'class-validator';

export class StatusNFeDto {
  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  chaveAcesso?: string;

  @IsOptional()
  @IsString()
  dataAutorizacao?: string;

  @IsOptional()
  @IsString()
  protocoloAutorizacao?: string;

  @IsOptional()
  @IsString()
  ultimaAtualizacao?: string;
}
