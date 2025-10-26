import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImpostoPersonalizadoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  aliquota: number;

  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class ConfiguracaoEstadoDto {
  @IsString()
  @IsNotEmpty()
  uf: string;

  @IsBoolean()
  habilitado: boolean;

  @IsString()
  @IsOptional()
  cfop?: string;

  @IsString()
  @IsOptional()
  naturezaOperacaoDescricao?: string;

  @IsString()
  @IsOptional()
  localDestinoOperacao?: 'interna' | 'interestadual' | 'exterior';

  // ICMS
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsAliquota?: number;

  @IsString()
  @IsOptional()
  icmsCST?: string;

  @IsString()
  @IsOptional()
  icmsOrigem?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsBaseCalculo?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsReducaoBase?: number;

  @IsString()
  @IsOptional()
  icmsModalidade?: string;

  // ICMS - Campos de configuração (checkboxes)
  @IsBoolean()
  @IsOptional()
  icmsSimples?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsReduzirBase?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsIncluirFrete?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsCredita?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsIncluirDesconto?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsIncluirSeguro?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsIncluirOutrasDespesas?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsImportacao?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsDebita?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsIncluirIpi?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsReduzirValor?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsIncluirDespesas?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsAliquotaDeferimento?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsFcp?: number;

  @IsString()
  @IsOptional()
  icmsMotivoDesoneracao?: string;

  // ICMS ST
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsStAliquota?: number;

  @IsString()
  @IsOptional()
  icmsStCST?: string;

  @IsString()
  @IsOptional()
  icmsStOrigem?: string;

  @IsString()
  @IsOptional()
  icmsStModalidade?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsStMva?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsStReducaoBase?: number;

  // ICMS ST - Campos de configuração (checkboxes)
  @IsBoolean()
  @IsOptional()
  icmsStSimples?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStReduzirBase?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStIncluirFrete?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStIncluirSeguro?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStIncluirOutrasDespesas?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStReduzirValor?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStIncluirDespesas?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStCredita?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStIncluirDesconto?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStImportacao?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStDebita?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStIncluirIpi?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsStFecop?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsStPmpf?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsStFcp?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsStInterno?: number;

  @IsBoolean()
  @IsOptional()
  icmsStDestacar?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStPmpfConsumidorFinal?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsStDifal?: boolean;

  // ICMS Consumidor Final
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsConsumidorFinalAliquota?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsConsumidorFinalDifal?: number;

  // ICMS Consumidor Final - Campos de configuração (checkboxes)
  @IsBoolean()
  @IsOptional()
  icmsConsumidorFinalIncluirInterno?: boolean;

  @IsBoolean()
  @IsOptional()
  icmsConsumidorFinalNaoDevido?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsConsumidorFinalInterno?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsConsumidorFinalOperacao?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsConsumidorFinalProvisorioOrigem?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsConsumidorFinalProvisorioDestino?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  icmsConsumidorFinalFcp?: number;

  // PIS
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  pisAliquota?: number;

  @IsString()
  @IsOptional()
  pisCST?: string;

  // PIS - Campos de configuração (checkboxes)
  @IsBoolean()
  @IsOptional()
  pisSimples?: boolean;

  @IsBoolean()
  @IsOptional()
  pisReduzirBase?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  pisReducaoBase?: number;

  @IsBoolean()
  @IsOptional()
  pisCredita?: boolean;

  @IsBoolean()
  @IsOptional()
  pisDebita?: boolean;

  @IsBoolean()
  @IsOptional()
  pisIncluirDespesas?: boolean;

  @IsBoolean()
  @IsOptional()
  pisAplicarProduto?: boolean;

  @IsBoolean()
  @IsOptional()
  pisImportacao?: boolean;

  @IsBoolean()
  @IsOptional()
  pisIncluirFrete?: boolean;

  @IsBoolean()
  @IsOptional()
  pisIncluirDesconto?: boolean;

  // COFINS
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  cofinsAliquota?: number;

  @IsString()
  @IsOptional()
  cofinsCST?: string;

  // COFINS - Campos de configuração (checkboxes)
  @IsBoolean()
  @IsOptional()
  cofinsSimples?: boolean;

  @IsBoolean()
  @IsOptional()
  cofinsReduzirBase?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  cofinsReducaoBase?: number;

  @IsBoolean()
  @IsOptional()
  cofinsCredita?: boolean;

  @IsBoolean()
  @IsOptional()
  cofinsDebita?: boolean;

  @IsBoolean()
  @IsOptional()
  cofinsIncluirDespesas?: boolean;

  @IsBoolean()
  @IsOptional()
  cofinsAplicarProduto?: boolean;

  @IsBoolean()
  @IsOptional()
  cofinsImportacao?: boolean;

  @IsBoolean()
  @IsOptional()
  cofinsIncluirFrete?: boolean;

  @IsBoolean()
  @IsOptional()
  cofinsIncluirDesconto?: boolean;

  // IPI
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  ipiAliquota?: number;

  @IsString()
  @IsOptional()
  ipiCST?: string;

  @IsString()
  @IsOptional()
  ipiClasse?: string;

  @IsString()
  @IsOptional()
  ipiCodigo?: string;

  @IsBoolean()
  @IsOptional()
  ipiSimples?: boolean;

  @IsBoolean()
  @IsOptional()
  ipiReduzirBase?: boolean;

  @IsBoolean()
  @IsOptional()
  ipiIncluirFrete?: boolean;

  @IsBoolean()
  @IsOptional()
  ipiIncluirDesconto?: boolean;

  @IsBoolean()
  @IsOptional()
  ipiIncluirDespesas?: boolean;

  @IsBoolean()
  @IsOptional()
  ipiCredita?: boolean;

  @IsBoolean()
  @IsOptional()
  ipiDebita?: boolean;

  @IsBoolean()
  @IsOptional()
  ipiImportacao?: boolean;

  // ISS
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  issAliquota?: number;

  @IsBoolean()
  @IsOptional()
  issRetencao?: boolean;

  @IsString()
  @IsOptional()
  issCST?: string;

  @IsString()
  @IsOptional()
  issSituacao?: string;

  @IsString()
  @IsOptional()
  issNaturezaOperacao?: string;

  // ISS - Impostos Retidos
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  issPorcentagem?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  issAcimaDe?: number;

  @IsBoolean()
  @IsOptional()
  issRetido?: boolean;

  // CSLL - Impostos Retidos
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  csllPorcentagem?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  csllAcimaDe?: number;

  @IsBoolean()
  @IsOptional()
  csllRetido?: boolean;

  // PIS - Impostos Retidos
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  pisPorcentagem?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pisAcimaDe?: number;

  @IsBoolean()
  @IsOptional()
  pisRetido?: boolean;

  // INSS - Impostos Retidos
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  inssPorcentagem?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  inssAcimaDe?: number;

  @IsBoolean()
  @IsOptional()
  inssRetido?: boolean;

  // IR - Impostos Retidos
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  irPorcentagem?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  irAcimaDe?: number;

  @IsBoolean()
  @IsOptional()
  irRetido?: boolean;

  // COFINS - Impostos Retidos
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  cofinsPorcentagem?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cofinsAcimaDe?: number;

  @IsBoolean()
  @IsOptional()
  cofinsRetido?: boolean;

  // Outros Impostos
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ImpostoPersonalizadoDto)
  outrosImpostos?: ImpostoPersonalizadoDto[];

  // Informações Adicionais
  @IsString()
  @IsOptional()
  informacoesInteresseFisco?: string;

  @IsString()
  @IsOptional()
  informacoesInteresseContribuinte?: string;
}
