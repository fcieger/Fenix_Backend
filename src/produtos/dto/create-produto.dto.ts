import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDecimal,
} from 'class-validator';

export class CreateProdutoDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  apelido?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsOptional()
  @IsString()
  tipoProduto?: string;

  @IsOptional()
  @IsString()
  unidadeMedida?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  referencia?: string;

  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @IsOptional()
  @IsString()
  ncm?: string;

  @IsOptional()
  @IsString()
  cest?: string;

  @IsOptional()
  @IsString()
  tipoProdutoSped?: string;

  @IsOptional()
  @IsString()
  origemProdutoSped?: string;

  @IsOptional()
  @IsString()
  categoriaProduto?: string;

  @IsOptional()
  @IsNumber()
  custo?: number;

  @IsOptional()
  @IsNumber()
  preco?: number;

  @IsOptional()
  @IsBoolean()
  produtoInativo?: boolean;

  @IsOptional()
  @IsBoolean()
  usarApelidoComoNomePrincipal?: boolean;

  @IsOptional()
  @IsBoolean()
  integracaoMarketplace?: boolean;

  // Dimensões e Peso
  @IsOptional()
  @IsNumber()
  peso?: number;

  @IsOptional()
  @IsNumber()
  altura?: number;

  @IsOptional()
  @IsNumber()
  largura?: number;

  @IsOptional()
  @IsNumber()
  profundidade?: number;

  @IsOptional()
  @IsNumber()
  pesoLiquido?: number;

  @IsOptional()
  @IsNumber()
  pesoBruto?: number;

  // Embalagem
  @IsOptional()
  @IsNumber()
  alturaEmbalagem?: number;

  @IsOptional()
  @IsNumber()
  larguraEmbalagem?: number;

  @IsOptional()
  @IsNumber()
  profundidadeEmbalagem?: number;

  @IsOptional()
  @IsNumber()
  pesoEmbalagem?: number;

  @IsOptional()
  @IsNumber()
  quantidadePorEmbalagem?: number;

  @IsOptional()
  @IsString()
  tipoEmbalagem?: string;

  // Características Físicas
  @IsOptional()
  @IsString()
  cor?: string;

  @IsOptional()
  @IsString()
  tamanho?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  voltagem?: string;

  @IsOptional()
  @IsString()
  potencia?: string;

  @IsOptional()
  @IsString()
  capacidade?: string;

  // Garantia e Certificações
  @IsOptional()
  @IsNumber()
  garantiaMeses?: number;

  @IsOptional()
  @IsString()
  certificacoes?: string;

  @IsOptional()
  @IsString()
  normasTecnicas?: string;

  // Informações Adicionais
  @IsOptional()
  @IsString()
  fabricante?: string;

  @IsOptional()
  @IsString()
  fornecedorPrincipal?: string;

  @IsOptional()
  @IsString()
  paisOrigem?: string;

  @IsOptional()
  @IsString()
  linkFichaTecnica?: string;

  @IsOptional()
  @IsString()
  observacoesTecnicas?: string;
}
