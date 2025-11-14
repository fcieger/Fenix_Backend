import { IsNotEmpty, IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class SolicitarAntecipacaoDto {
  @IsNotEmpty({ message: 'Os títulos são obrigatórios' })
  @IsArray({ message: 'Os títulos devem ser um array' })
  @ArrayMinSize(1, { message: 'Selecione pelo menos 1 título' })
  @IsUUID('4', { each: true, message: 'IDs de títulos inválidos' })
  titulosIds: string[];
}




