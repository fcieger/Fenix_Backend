import { IsNotEmpty, IsNumber, IsString, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UtilizarCapitalDto {
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @Min(100, { message: 'O valor mínimo é R$ 100,00' })
  @Transform(({ value }) => parseFloat(value))
  valor: number;

  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString({ message: 'A descrição deve ser um texto' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres' })
  descricao: string;
}




