export class CalcularImpostosItemDto {
  produtoId?: string;
  nome: string;
  ncm?: string;
  cest?: string;
  quantidade: number;
  valorUnitario: number;
  valorDesconto?: number;
  freteRateado?: number;
  despesasRateadas?: number;
  cbenef?: string;
  // CSTs opcionais por item (se não vierem, usa da configuração/UF)
  icmsCST?: string;
  ipiCST?: string;
  pisCST?: string;
  cofinsCST?: string;
}

export class CalcularImpostosPedidoDto {
  companyId: string;
  clienteId?: string;
  naturezaOperacaoId: string;
  ufOrigem: string;
  ufDestino: string;
  incluirFreteTotal?: boolean;
  valorFrete?: number;
  despesas?: number;
  itens: CalcularImpostosItemDto[];
}

export type ImpostoValor = {
  base: number;
  aliquota?: number;
  valor: number;
  cst?: string;
  cbenef?: string;
  qtdTributada?: number;
  aliquotaUnidade?: number;
  // Campos específicos para ICMS diferimento
  valorDiferido?: number;
  percentualDiferimento?: number;
  // Campos específicos para ICMS ST anterior
  valorStAnterior?: number;
  ufStAnterior?: string;
};

export class ImpostosItemCalculado {
  produtoId?: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  subtotal: number;
  desconto: number;
  baseCalculo: number;
  pis?: ImpostoValor;
  cofins?: ImpostoValor;
  iss?: ImpostoValor;
  ipi?: ImpostoValor;
  icms?: ImpostoValor;
  icmsSt?: ImpostoValor;
  retencoes?: {
    csll?: ImpostoValor;
    pis?: ImpostoValor;
    inss?: ImpostoValor;
    ir?: ImpostoValor;
    cofins?: ImpostoValor;
  };
  totalImpostos: number;
}

export class CalcularImpostosResponseDto {
  itens: ImpostosItemCalculado[];
  totais: {
    totalProdutos: number;
    totalDescontos: number;
    totalImpostos: number;
    totalPedido: number;
  };
}
