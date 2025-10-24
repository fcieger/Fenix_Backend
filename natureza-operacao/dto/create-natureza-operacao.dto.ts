import { IsString, IsNotEmpty, Length, Matches, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class CreateNaturezaOperacaoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: 'CFOP deve conter exatamente 4 dígitos' })
  cfop: string;

  @IsEnum(['compras', 'vendas', 'servicos', 'cupom_fiscal', 'ecommerce', 'devolucao_vendas', 'devolucao_compras', 'outras_movimentacoes'])
  @IsNotEmpty()
  tipo: string;

  @IsBoolean()
  @IsOptional()
  movimentaEstoque?: boolean;

  @IsBoolean()
  @IsOptional()
  habilitado?: boolean;

  @IsBoolean()
  @IsOptional()
  considerarOperacaoComoFaturamento?: boolean;

  @IsBoolean()
  @IsOptional()
  destacarTotalImpostosIBPT?: boolean;

  @IsBoolean()
  @IsOptional()
  gerarContasReceberPagar?: boolean;

  @IsEnum(['data_emissao', 'data_vencimento'])
  @IsOptional()
  tipoDataContasReceberPagar?: string;

  @IsString()
  @IsOptional()
  informacoesAdicionaisFisco?: string;

  @IsString()
  @IsOptional()
  informacoesAdicionaisContribuinte?: string;
}
