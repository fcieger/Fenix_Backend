import { IsString, IsUUID, IsOptional } from 'class-validator';

export class EmitirNFeDto {
  @IsString()
  @IsUUID()
  nfeId: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
