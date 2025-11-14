import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, MaxLength, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePropostaDto {
  @IsNotEmpty({ message: 'O ID da solicitação é obrigatório' })
  @IsString()
  solicitacaoId: string;

  @IsNotEmpty({ message: 'A instituição financeira é obrigatória' })
  @IsString({ message: 'A instituição financeira deve ser um texto' })
  @MaxLength(200, { message: 'A instituição financeira deve ter no máximo 200 caracteres' })
  instituicaoFinanceira: string;

  @IsNotEmpty({ message: 'O valor aprovado é obrigatório' })
  @IsNumber({}, { message: 'O valor aprovado deve ser um número' })
  @Min(1000, { message: 'O valor mínimo é R$ 1.000,00' })
  @Transform(({ value }) => parseFloat(value))
  valorAprovado: number;

  @IsNotEmpty({ message: 'A taxa de juros é obrigatória' })
  @IsNumber({}, { message: 'A taxa de juros deve ser um número' })
  @Min(0.1, { message: 'A taxa de juros mínima é 0,1%' })
  @Max(15, { message: 'A taxa de juros máxima é 15%' })
  @Transform(({ value }) => parseFloat(value))
  taxaJuros: number;

  @IsNotEmpty({ message: 'A taxa de intermediação é obrigatória' })
  @IsNumber({}, { message: 'A taxa de intermediação deve ser um número' })
  @Min(0, { message: 'A taxa de intermediação mínima é 0%' })
  @Max(10, { message: 'A taxa de intermediação máxima é 10%' })
  @Transform(({ value }) => parseFloat(value))
  taxaIntermediacao: number;

  @IsNotEmpty({ message: 'O prazo é obrigatório' })
  @IsInt({ message: 'O prazo deve ser um número inteiro' })
  @Min(1, { message: 'O prazo mínimo é 1 mês' })
  @Max(60, { message: 'O prazo máximo é 60 meses' })
  prazoMeses: number;

  @IsNotEmpty({ message: 'A validade da proposta é obrigatória' })
  @IsInt({ message: 'A validade deve ser um número inteiro' })
  @Min(1, { message: 'A validade mínima é 1 dia' })
  @Max(30, { message: 'A validade máxima é 30 dias' })
  diasValidade: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  condicoesGerais?: string;
}




