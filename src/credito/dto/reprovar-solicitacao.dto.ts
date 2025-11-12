import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReprovarSolicitacaoDto {
  @IsNotEmpty({ message: 'O motivo da reprovação é obrigatório' })
  @IsString({ message: 'O motivo deve ser um texto' })
  @MaxLength(1000, { message: 'O motivo deve ter no máximo 1000 caracteres' })
  motivoReprovacao: string;
}



