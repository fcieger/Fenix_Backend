import { IsString, IsOptional, IsObject } from 'class-validator';

export class WebhookNFeDto {
  @IsString()
  nfeId: string;

  @IsString()
  empresaId: string;

  @IsString()
  chaveAcesso: string;

  @IsString()
  status: string;

  @IsString()
  dataAtualizacao: string;

  @IsOptional()
  @IsString()
  xmlNfe?: string;

  @IsOptional()
  @IsString()
  protocoloAutorizacao?: string;

  @IsOptional()
  @IsObject()
  erros?: any[];
}





