import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class RecusarPropostaDto {
  @IsNotEmpty({ message: 'O motivo da recusa é obrigatório' })
  @IsString({ message: 'O motivo deve ser um texto' })
  @MaxLength(200, { message: 'O motivo deve ter no máximo 200 caracteres' })
  motivo: string;

  @IsOptional()
  @IsString({ message: 'O comentário deve ser um texto' })
  @MaxLength(500, { message: 'O comentário deve ter no máximo 500 caracteres' })
  comentario?: string;
}



