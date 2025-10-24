import { IsString, IsUUID } from 'class-validator';

export class SincronizarNFeDto {
  @IsString()
  @IsUUID()
  nfeId: string;
}





