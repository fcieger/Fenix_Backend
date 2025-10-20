import { 
  IsString, 
  IsUUID, 
  IsBoolean, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsDateString, 
  IsArray, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';
import { 
  StatusPedido, 
  TipoFrete, 
  IndicadorPresenca, 
  FormaPagamento, 
  TipoEstoque 
} from '../../shared/enums/pedido-venda.enums';
import { CreatePedidoVendaItemDto } from './create-pedido-venda-item.dto';

export class CreatePedidoVendaDto {
  @IsString()
  numeroPedido: string;

  @IsString()
  @IsOptional()
  numeroNFe?: string;

  @IsDateString()
  dataEmissao: string;

  @IsDateString()
  @IsOptional()
  dataPrevisao?: string;

  @IsDateString()
  @IsOptional()
  dataEntrega?: string;

  @IsString()
  numeroOrdemCompra: string;

  @IsUUID()
  clienteId: string;

  @IsUUID()
  @IsOptional()
  vendedorId?: string;

  @IsUUID()
  @IsOptional()
  transportadoraId?: string;

  @IsUUID()
  naturezaOperacaoId: string;

  @IsUUID()
  @IsOptional()
  prazoPagamentoId?: string;

  @IsBoolean()
  @IsOptional()
  consumidorFinal?: boolean;

  @IsEnum(IndicadorPresenca)
  @IsOptional()
  indicadorPresenca?: IndicadorPresenca;

  @IsEnum(FormaPagamento)
  @IsOptional()
  formaPagamento?: FormaPagamento;

  @IsString()
  @IsOptional()
  parcelamento?: string;

  @IsEnum(TipoEstoque)
  @IsOptional()
  estoque?: TipoEstoque;

  @IsString()
  @IsOptional()
  listaPreco?: string;

  @IsEnum(TipoFrete)
  @IsOptional()
  frete?: TipoFrete;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  valorFrete?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  despesas?: number;

  @IsBoolean()
  @IsOptional()
  incluirFreteTotal?: boolean;

  // Dados do Veículo
  @IsString()
  @IsOptional()
  placaVeiculo?: string;

  @IsString()
  @IsOptional()
  ufPlaca?: string;

  @IsString()
  @IsOptional()
  rntc?: string;

  // Dados de Volume e Peso
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pesoLiquido?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pesoBruto?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  volume?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quantidadeVolumes?: number;

  @IsString()
  @IsOptional()
  especie?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  numeracao?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalDescontos?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalImpostos?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalProdutos?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  totalPedido?: number;

  @IsEnum(StatusPedido)
  @IsOptional()
  status?: StatusPedido;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoVendaItemDto)
  itens: CreatePedidoVendaItemDto[];
}
