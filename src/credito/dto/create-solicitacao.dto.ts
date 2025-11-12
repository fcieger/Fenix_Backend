import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSolicitacaoDto {
  @IsNotEmpty({ message: 'O valor solicitado é obrigatório' })
  @IsNumber({}, { message: 'O valor solicitado deve ser um número' })
  @Min(1000, { message: 'O valor mínimo é R$ 1.000,00' })
  @Transform(({ value }) => parseFloat(value))
  valorSolicitado: number;

  @IsNotEmpty({ message: 'A finalidade é obrigatória' })
  @IsString({ message: 'A finalidade deve ser um texto' })
  @MaxLength(1000, { message: 'A finalidade deve ter no máximo 1000 caracteres' })
  finalidade: string;

  @IsOptional()
  @IsString({ message: 'O tipo de garantia deve ser um texto' })
  @Transform(({ value }) => value === '' ? undefined : value)
  tipoGarantia?: string;

  @IsOptional()
  @IsString({ message: 'A descrição da garantia deve ser um texto' })
  @Transform(({ value }) => value === '' ? undefined : value)
  descricaoGarantia?: string;

  @IsOptional()
  @IsNumber({}, { message: 'O faturamento médio deve ser um número' })
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    return parseFloat(value);
  })
  faturamentoMedio?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O tempo de atividade deve ser um número' })
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    return parseInt(value, 10);
  })
  tempoAtividadeAnos?: number;

  @IsOptional()
  @IsNumber({}, { message: 'O número de funcionários deve ser um número' })
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    return parseInt(value, 10);
  })
  numeroFuncionarios?: number;

  @IsOptional()
  @IsBoolean({ message: 'O campo possui restrições deve ser verdadeiro ou falso' })
  @Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return undefined;
  })
  possuiRestricoes?: boolean;

  @IsOptional()
  @IsString({ message: 'As observações devem ser um texto' })
  @Transform(({ value }) => value === '' ? undefined : value)
  observacoes?: string;
}


