import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AceitarPropostaDto {
  @IsNotEmpty({ message: 'A senha de confirmação é obrigatória' })
  @IsString({ message: 'A senha deve ser um texto' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}



