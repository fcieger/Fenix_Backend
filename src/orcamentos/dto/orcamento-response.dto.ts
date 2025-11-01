import { Expose } from 'class-transformer';

export class OrcamentoResponseDto {
  @Expose()
  id: string;

  @Expose()
  numero: string;

  @Expose()
  serie: string;

  @Expose()
  numeroOrdemCompra: string;

  @Expose()
  dataEmissao: Date;

  @Expose()
  dataPrevisaoEntrega: Date;

  @Expose()
  dataEntrega: Date;

  @Expose()
  cliente: any;

  @Expose()
  clienteId: string;

  @Expose()
  vendedor: any;

  @Expose()
  vendedorId: string;

  @Expose()
  transportadora: any;

  @Expose()
  transportadoraId: string;

  @Expose()
  prazoPagamento: any;

  @Expose()
  prazoPagamentoId: string;

  @Expose()
  naturezaOperacaoPadrao: any;

  @Expose()
  naturezaOperacaoPadraoId: string;

  @Expose()
  formaPagamento: any;

  @Expose()
  formaPagamentoId: string;

  @Expose()
  parcelamento: string;

  @Expose()
  consumidorFinal: boolean;

  @Expose()
  indicadorPresenca: string;

  @Expose()
  localEstoque: any;

  @Expose()
  localEstoqueId: string;

  @Expose()
  listaPreco: string;

  @Expose()
  frete: string;

  @Expose()
  valorFrete: number;

  @Expose()
  despesas: number;

  @Expose()
  incluirFreteTotal: boolean;

  @Expose()
  placaVeiculo: string;

  @Expose()
  ufPlaca: string;

  @Expose()
  rntc: string;

  @Expose()
  pesoLiquido: number;

  @Expose()
  pesoBruto: number;

  @Expose()
  volume: number;

  @Expose()
  especie: string;

  @Expose()
  marca: string;

  @Expose()
  numeracao: string;

  @Expose()
  quantidadeVolumes: number;

  @Expose()
  totalProdutos: number;

  @Expose()
  totalDescontos: number;

  @Expose()
  totalImpostos: number;

  @Expose()
  totalGeral: number;

  @Expose()
  observacoes: string;

  @Expose()
  status: string;

  @Expose()
  companyId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  itens: any[];
}


