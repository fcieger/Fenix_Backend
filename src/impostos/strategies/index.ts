import { ImpostoValor } from '../dto/calcular-impostos.dto';
import { CST_ICMS, CST_IPI, CST_PIS_COFINS } from '../csts.enums';

export type CtxBase = {
  subtotal: number;
  desconto: number;
  freteItem: number;
  despItem: number;
  cbenef?: string;
  conf: any;
};

export type OutICMS = { icms?: ImpostoValor; icmsSt?: ImpostoValor };
export type OutIPI = { ipi?: ImpostoValor };

export function arred2(n: number) {
  return Number(n.toFixed(2));
}

export function baseCalc({
  subtotal,
  desconto,
  freteItem,
  despItem,
  incluiFrete,
  incluiDesp,
  reducao,
}: {
  subtotal: number;
  desconto: number;
  freteItem: number;
  despItem: number;
  incluiFrete?: boolean;
  incluiDesp?: boolean;
  reducao?: number;
}) {
  let base = subtotal - desconto;
  if (incluiFrete) base += freteItem;
  if (incluiDesp) base += despItem;
  if (reducao && reducao > 0) base = base * (1 - reducao / 100);
  return arred2(Math.max(0, base));
}

// ===== ICMS STRATEGIES =====
export const ICMS_STRATEGIES: Record<string, (ctx: CtxBase) => OutICMS> = {
  '00': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Tributada integralmente
    const base = baseCalc({
      subtotal,
      desconto,
      freteItem,
      despItem,
      incluiFrete: !!conf.icmsIncluirFrete,
      incluiDesp: !!conf.icmsIncluirDespesas,
      reducao: Number(conf.icmsReducaoBase || 0),
    });
    const aliq = Number(conf.icmsAliquota || 0);
    if (base <= 0 || aliq <= 0) return {};
    return {
      icms: {
        base,
        aliquota: aliq,
        valor: arred2((base * aliq) / 100),
        cst: conf.icmsCST,
      },
    };
  },
  '10': (ctx) => {
    // Tributada e com cobrança do ICMS por substituição tributária
    const baseIcms = baseCalc({
      subtotal: ctx.subtotal,
      desconto: ctx.desconto,
      freteItem: ctx.freteItem,
      despItem: ctx.despItem,
      incluiFrete: !!ctx.conf.icmsIncluirFrete,
      incluiDesp: !!ctx.conf.icmsIncluirDespesas,
      reducao: Number(ctx.conf.icmsReducaoBase || 0),
    });
    const aliqIcms = Number(ctx.conf.icmsAliquota || 0);
    const icmsValor =
      baseIcms > 0 && aliqIcms > 0 ? arred2((baseIcms * aliqIcms) / 100) : 0;

    // ST: Base com MVA, redução e alíquota ST
    const baseComMVA = arred2(
      baseIcms * (1 + Number(ctx.conf.icmsMVA || 0) / 100),
    );
    const baseSt = arred2(
      baseComMVA * (1 - Number(ctx.conf.icmsStReducaoBase || 0) / 100),
    );
    const aliqSt = Number(ctx.conf.icmsStAliquota || 0);
    let stValor =
      baseSt > 0 && aliqSt > 0 ? arred2((baseSt * aliqSt) / 100) : 0;
    stValor = Math.max(0, arred2(stValor - icmsValor));

    return {
      icms:
        baseIcms > 0 && aliqIcms > 0
          ? {
              base: baseIcms,
              aliquota: aliqIcms,
              valor: icmsValor,
              cst: ctx.conf.icmsCST,
            }
          : undefined,
      icmsSt:
        baseSt > 0 && aliqSt > 0
          ? {
              base: baseSt,
              aliquota: aliqSt,
              valor: stValor,
              cst: ctx.conf.icmsCSTSt || ctx.conf.icmsCST,
            }
          : undefined,
    };
  },
  '20': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Tributada e com redução da base de cálculo
    const base = baseCalc({
      subtotal,
      desconto,
      freteItem,
      despItem,
      incluiFrete: !!conf.icmsIncluirFrete,
      incluiDesp: !!conf.icmsIncluirDespesas,
      reducao: Number(conf.icmsReducaoBase || 0),
    });
    const aliq = Number(conf.icmsAliquota || 0);
    if (base <= 0 || aliq <= 0) return {};
    return {
      icms: {
        base,
        aliquota: aliq,
        valor: arred2((base * aliq) / 100),
        cst: conf.icmsCST,
      },
    };
  },
  '30': (ctx) => {
    // Isenta ou não tributada e com cobrança do ICMS por substituição tributária
    const base = baseCalc({
      subtotal: ctx.subtotal,
      desconto: ctx.desconto,
      freteItem: ctx.freteItem,
      despItem: ctx.despItem,
      incluiFrete: !!ctx.conf.icmsIncluirFrete,
      incluiDesp: !!ctx.conf.icmsIncluirDespesas,
      reducao: Number(ctx.conf.icmsReducaoBase || 0),
    });
    const baseComMVA = arred2(base * (1 + Number(ctx.conf.icmsMVA || 0) / 100));
    const baseSt = arred2(
      baseComMVA * (1 - Number(ctx.conf.icmsStReducaoBase || 0) / 100),
    );
    const aliqSt = Number(ctx.conf.icmsStAliquota || 0);
    const stValor =
      baseSt > 0 && aliqSt > 0 ? arred2((baseSt * aliqSt) / 100) : 0;

    return {
      icms: undefined, // Isenta
      icmsSt:
        baseSt > 0 && aliqSt > 0
          ? {
              base: baseSt,
              aliquota: aliqSt,
              valor: stValor,
              cst: ctx.conf.icmsCSTSt || ctx.conf.icmsCST,
            }
          : undefined,
    };
  },
  '40': (ctx) => {
    // Isenta
    return { icms: undefined, icmsSt: undefined };
  },
  '41': (ctx) => {
    // Não tributada
    return { icms: undefined, icmsSt: undefined };
  },
  '50': (ctx) => {
    // Suspensão
    return { icms: undefined, icmsSt: undefined };
  },
  '51': (ctx) => {
    // Diferimento
    const base = baseCalc({
      subtotal: ctx.subtotal,
      desconto: ctx.desconto,
      freteItem: ctx.freteItem,
      despItem: ctx.despItem,
      incluiFrete: !!ctx.conf.icmsIncluirFrete,
      incluiDesp: !!ctx.conf.icmsIncluirDespesas,
      reducao: Number(ctx.conf.icmsReducaoBase || 0),
    });
    const aliq = Number(ctx.conf.icmsAliquota || 0);
    const valorDiferido = base && aliq > 0 ? arred2((base * aliq) / 100) : 0;
    const percentualDiferimento = Number(
      ctx.conf.icmsPercentualDiferimento || 100,
    );

    return {
      icms:
        base && aliq > 0
          ? {
              base,
              aliquota: aliq,
              valor: valorDiferido,
              cst: ctx.conf.icmsCST,
              // Campos específicos para diferimento
              valorDiferido: arred2(
                (valorDiferido * percentualDiferimento) / 100,
              ),
              percentualDiferimento,
            }
          : undefined,
      icmsSt: undefined,
    };
  },
  '60': (ctx) => {
    // ICMS cobrado anteriormente por substituição tributária
    const base = baseCalc({
      subtotal: ctx.subtotal,
      desconto: ctx.desconto,
      freteItem: ctx.freteItem,
      despItem: ctx.despItem,
      incluiFrete: !!ctx.conf.icmsIncluirFrete,
      incluiDesp: !!ctx.conf.icmsIncluirDespesas,
      reducao: Number(ctx.conf.icmsReducaoBase || 0),
    });
    const aliq = Number(ctx.conf.icmsAliquota || 0);
    const valorStAnterior = base && aliq > 0 ? arred2((base * aliq) / 100) : 0;

    return {
      icms: undefined,
      icmsSt:
        base && aliq > 0
          ? {
              base,
              aliquota: aliq,
              valor: valorStAnterior,
              cst: ctx.conf.icmsCST,
              // Campos específicos para ST anterior
              valorStAnterior,
              ufStAnterior: ctx.conf.ufOrigem,
            }
          : undefined,
    };
  },
  '70': (ctx) => {
    // Tributada e com redução da base de cálculo e com cobrança do ICMS por substituição tributária
    const baseIcms = baseCalc({
      subtotal: ctx.subtotal,
      desconto: ctx.desconto,
      freteItem: ctx.freteItem,
      despItem: ctx.despItem,
      incluiFrete: !!ctx.conf.icmsIncluirFrete,
      incluiDesp: !!ctx.conf.icmsIncluirDespesas,
      reducao: Number(ctx.conf.icmsReducaoBase || 0),
    });
    const aliqIcms = Number(ctx.conf.icmsAliquota || 0);
    const icmsValor =
      baseIcms > 0 && aliqIcms > 0 ? arred2((baseIcms * aliqIcms) / 100) : 0;

    const baseComMVA = arred2(
      baseIcms * (1 + Number(ctx.conf.icmsMVA || 0) / 100),
    );
    const baseSt = arred2(
      baseComMVA * (1 - Number(ctx.conf.icmsStReducaoBase || 0) / 100),
    );
    const aliqSt = Number(ctx.conf.icmsStAliquota || 0);
    let stValor =
      baseSt > 0 && aliqSt > 0 ? arred2((baseSt * aliqSt) / 100) : 0;
    stValor = Math.max(0, arred2(stValor - icmsValor));

    return {
      icms:
        baseIcms > 0 && aliqIcms > 0
          ? {
              base: baseIcms,
              aliquota: aliqIcms,
              valor: icmsValor,
              cst: ctx.conf.icmsCST,
            }
          : undefined,
      icmsSt:
        baseSt > 0 && aliqSt > 0
          ? {
              base: baseSt,
              aliquota: aliqSt,
              valor: stValor,
              cst: ctx.conf.icmsCSTSt || ctx.conf.icmsCST,
            }
          : undefined,
    };
  },
  '90': (ctx) => {
    // Outras obrigações
    const base = baseCalc({
      subtotal: ctx.subtotal,
      desconto: ctx.desconto,
      freteItem: ctx.freteItem,
      despItem: ctx.despItem,
      incluiFrete: !!ctx.conf.icmsIncluirFrete,
      incluiDesp: !!ctx.conf.icmsIncluirDespesas,
      reducao: Number(ctx.conf.icmsReducaoBase || 0),
    });
    const aliq = Number(ctx.conf.icmsAliquota || 0);
    const valor = base && aliq > 0 ? arred2((base * aliq) / 100) : 0;

    // Pode ter ST também
    const baseComMVA = arred2(
      (base || 0) * (1 + Number(ctx.conf.icmsMVA || 0) / 100),
    );
    const baseSt = arred2(
      baseComMVA * (1 - Number(ctx.conf.icmsStReducaoBase || 0) / 100),
    );
    const aliqSt = Number(ctx.conf.icmsStAliquota || 0);
    const stValor =
      baseSt > 0 && aliqSt > 0 ? arred2((baseSt * aliqSt) / 100) : 0;

    return {
      icms:
        base && aliq > 0
          ? { base, aliquota: aliq, valor, cst: ctx.conf.icmsCST }
          : undefined,
      icmsSt:
        baseSt > 0 && aliqSt > 0
          ? {
              base: baseSt,
              aliquota: aliqSt,
              valor: stValor,
              cst: ctx.conf.icmsCSTSt || ctx.conf.icmsCST,
            }
          : undefined,
    };
  },
  DEFAULT: () => ({ icms: undefined, icmsSt: undefined }),
};

// ===== IPI STRATEGIES =====
export const IPI_STRATEGIES: Record<
  string,
  (ctx: CtxBase & { qtd?: number }) => OutIPI
> = {
  '00': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Entrada com recuperação de crédito
    const base = baseCalc({
      subtotal,
      desconto,
      freteItem,
      despItem,
      incluiFrete: !!conf.ipiIncluirFrete,
      incluiDesp: !!conf.ipiIncluirDespesas,
      reducao: Number(conf.ipiReducaoBase || 0),
    });
    const aliq = Number(conf.ipiAliquota || 0);
    if (base <= 0 || aliq <= 0) return {};
    return {
      ipi: {
        base,
        aliquota: aliq,
        valor: arred2((base * aliq) / 100),
        cst: conf.ipiCST,
      },
    };
  },
  '01': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Entrada tributada com alíquota básica
    return IPI_STRATEGIES['00']({
      conf,
      subtotal,
      desconto,
      freteItem,
      despItem,
    });
  },
  '02': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Entrada tributada com alíquota diferenciada
    return IPI_STRATEGIES['00']({
      conf,
      subtotal,
      desconto,
      freteItem,
      despItem,
    });
  },
  '03': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Entrada tributada com alíquota por unidade de produto
    const base = baseCalc({
      subtotal,
      desconto,
      freteItem,
      despItem,
      incluiFrete: !!conf.ipiIncluirFrete,
      incluiDesp: !!conf.ipiIncluirDespesas,
      reducao: Number(conf.ipiReducaoBase || 0),
    });
    const aliq = Number(conf.ipiAliquota || 0);
    if (base <= 0 || aliq <= 0) return {};
    return {
      ipi: {
        base,
        aliquota: aliq,
        valor: arred2((base * aliq) / 100),
        cst: conf.ipiCST,
      },
    };
  },
  '04': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Entrada tributada com alíquota por unidade de produto
    return IPI_STRATEGIES['03']({
      conf,
      subtotal,
      desconto,
      freteItem,
      despItem,
    });
  },
  '05': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Entrada tributada com alíquota por unidade de produto
    return IPI_STRATEGIES['03']({
      conf,
      subtotal,
      desconto,
      freteItem,
      despItem,
    });
  },
  '49': (ctx) => {
    // Outras entradas
    return IPI_STRATEGIES['00'](ctx);
  },
  '50': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Saída tributada
    const base = baseCalc({
      subtotal,
      desconto,
      freteItem,
      despItem,
      incluiFrete: !!conf.ipiIncluirFrete,
      incluiDesp: !!conf.ipiIncluirDespesas,
      reducao: Number(conf.ipiReducaoBase || 0),
    });
    const aliq = Number(conf.ipiAliquota || 0);
    if (base <= 0 || aliq <= 0) return {};
    return {
      ipi: {
        base,
        aliquota: aliq,
        valor: arred2((base * aliq) / 100),
        cst: conf.ipiCST,
      },
    };
  },
  '51': ({ conf, subtotal, desconto, freteItem, despItem }) => {
    // Saída tributada com alíquota zero
    const base = baseCalc({
      subtotal,
      desconto,
      freteItem,
      despItem,
      incluiFrete: !!conf.ipiIncluirFrete,
      incluiDesp: !!conf.ipiIncluirDespesas,
      reducao: Number(conf.ipiReducaoBase || 0),
    });
    const aliq = Number(conf.ipiAliquota || 0);
    if (base <= 0) return {};
    return {
      ipi: {
        base,
        aliquota: aliq,
        valor: arred2((base * aliq) / 100),
        cst: conf.ipiCST,
      },
    };
  },
  '52': () => {
    // Saída isenta
    return { ipi: undefined };
  },
  '53': () => {
    // Saída isenta
    return { ipi: undefined };
  },
  '54': () => {
    // Saída isenta
    return { ipi: undefined };
  },
  '55': () => {
    // Saída suspensa
    return { ipi: undefined };
  },
  '99': ({ conf, subtotal, desconto, freteItem, despItem, qtd }) => {
    // Outras saídas
    if (conf.ipiAliquotaUnidade && qtd) {
      const valor = arred2(Number(conf.ipiAliquotaUnidade) * qtd);
      return {
        ipi: {
          base: 0,
          aliquotaUnidade: Number(conf.ipiAliquotaUnidade),
          valor,
          cst: conf.ipiCST,
          qtdTributada: qtd,
        },
      };
    }
    return IPI_STRATEGIES['00']({
      conf,
      subtotal,
      desconto,
      freteItem,
      despItem,
      qtd,
    });
  },
  DEFAULT: (ctx) => IPI_STRATEGIES['00'](ctx),
};

// ===== PIS STRATEGIES =====
export const PIS_STRATEGIES: Record<
  string,
  (ctx: CtxBase & { qtd?: number }) => ImpostoValor | undefined
> = {
  '01': ({ conf, subtotal, desconto, freteItem, despItem, cbenef }) => {
    // Operação tributável - Base de cálculo = valor da operação alíquota normal (cumulativo/não cumulativo)
    const base = baseCalc({
      subtotal,
      desconto,
      freteItem,
      despItem,
      incluiFrete: !!conf.pisIncluirFrete,
      incluiDesp: !!conf.pisIncluirDespesas,
      reducao: Number(conf.pisReducaoBase || 0),
    });
    const aliq = Number(conf.pisAliquota || 0);
    if (base <= 0 || aliq <= 0) return undefined;
    return {
      base,
      aliquota: aliq,
      valor: arred2((base * aliq) / 100),
      cst: conf.pisCST,
      cbenef,
    };
  },
  '02': (ctx) => {
    // Operação tributável - Base de cálculo = valor da operação (alíquota diferenciada)
    return PIS_STRATEGIES['01'](ctx);
  },
  '03': ({ conf, qtd, cbenef }) => {
    // Operação tributável - Base de cálculo = quantidade vendida x alíquota por unidade de produto
    if (!qtd || !conf.pisAliquotaUnidade) return undefined;
    const valor = arred2(Number(conf.pisAliquotaUnidade) * qtd);
    return {
      base: 0,
      aliquotaUnidade: Number(conf.pisAliquotaUnidade),
      valor,
      cst: conf.pisCST,
      cbenef,
      qtdTributada: qtd,
    };
  },
  '04': () => {
    // Operação tributável - Tributação monofásica (alíquota zero)
    return undefined;
  },
  '05': () => {
    // Operação tributável - ST
    return undefined;
  },
  '06': () => {
    // Operação tributável - Alíquota zero
    return undefined;
  },
  '07': () => {
    // Operação isenta da contribuição
    return undefined;
  },
  '08': () => {
    // Operação sem incidência da contribuição
    return undefined;
  },
  '09': () => {
    // Operação com suspensão da contribuição
    return undefined;
  },
  '49': (ctx) => {
    // Outras operações de saída
    return PIS_STRATEGIES['01'](ctx);
  },
  '50': (ctx) => {
    // Operação com direito a crédito - Vinculada exclusivamente a receita tributada no mercado interno
    return PIS_STRATEGIES['01'](ctx);
  },
  '51': (ctx) => {
    // Operação com direito a crédito - Vinculada exclusivamente a receita não tributada no mercado interno
    return PIS_STRATEGIES['01'](ctx);
  },
  '52': (ctx) => {
    // Operação com direito a crédito - Vinculada exclusivamente a receita de exportação
    return PIS_STRATEGIES['01'](ctx);
  },
  '53': (ctx) => {
    // Operação com direito a crédito - Vinculada a receitas tributadas e não-tributadas no mercado interno
    return PIS_STRATEGIES['01'](ctx);
  },
  '54': (ctx) => {
    // Operação com direito a crédito - Vinculada a receitas tributadas no mercado interno e de exportação
    return PIS_STRATEGIES['01'](ctx);
  },
  '55': (ctx) => {
    // Operação com direito a crédito - Vinculada a receitas não-tributadas no mercado interno e de exportação
    return PIS_STRATEGIES['01'](ctx);
  },
  '56': (ctx) => {
    // Operação com direito a crédito - Vinculada a receitas tributadas e não-tributadas no mercado interno e de exportação
    return PIS_STRATEGIES['01'](ctx);
  },
  '60': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada exclusivamente a receita tributada no mercado interno
    return PIS_STRATEGIES['01'](ctx);
  },
  '61': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada exclusivamente a receita não-tributada no mercado interno
    return PIS_STRATEGIES['01'](ctx);
  },
  '62': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada exclusivamente a receita de exportação
    return PIS_STRATEGIES['01'](ctx);
  },
  '63': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno
    return PIS_STRATEGIES['01'](ctx);
  },
  '64': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada a receitas tributadas no mercado interno e de exportação
    return PIS_STRATEGIES['01'](ctx);
  },
  '65': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada a receitas não-tributadas no mercado interno e de exportação
    return PIS_STRATEGIES['01'](ctx);
  },
  '66': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno e de exportação
    return PIS_STRATEGIES['01'](ctx);
  },
  '67': (ctx) => {
    // Crédito presunto - Outras operações
    return PIS_STRATEGIES['01'](ctx);
  },
  '70': (ctx) => {
    // Operação de aquisição sem direito a crédito
    return PIS_STRATEGIES['01'](ctx);
  },
  '71': (ctx) => {
    // Operação de aquisição com isenção
    return PIS_STRATEGIES['01'](ctx);
  },
  '72': (ctx) => {
    // Operação de aquisição com suspensão
    return PIS_STRATEGIES['01'](ctx);
  },
  '73': (ctx) => {
    // Operação de aquisição a alíquota zero
    return PIS_STRATEGIES['01'](ctx);
  },
  '74': (ctx) => {
    // Operação de aquisição sem incidência da contribuição
    return PIS_STRATEGIES['01'](ctx);
  },
  '75': (ctx) => {
    // Operação de aquisição por substituição tributária
    return PIS_STRATEGIES['01'](ctx);
  },
  '98': (ctx) => {
    // Outras operações de entrada
    return PIS_STRATEGIES['01'](ctx);
  },
  '99': (ctx) => {
    // Outras operações
    return PIS_STRATEGIES['01'](ctx);
  },
  DEFAULT: (ctx) => PIS_STRATEGIES['01'](ctx),
};

// ===== COFINS STRATEGIES =====
export const COFINS_STRATEGIES: Record<
  string,
  (ctx: CtxBase & { qtd?: number }) => ImpostoValor | undefined
> = {
  '01': ({ conf, subtotal, desconto, freteItem, despItem, cbenef }) => {
    // Operação tributável - Base de cálculo = valor da operação alíquota normal (cumulativo/não cumulativo)
    const base = baseCalc({
      subtotal,
      desconto,
      freteItem,
      despItem,
      incluiFrete: !!conf.cofinsIncluirFrete,
      incluiDesp: !!conf.cofinsIncluirDespesas,
      reducao: Number(conf.cofinsReducaoBase || 0),
    });
    const aliq = Number(conf.cofinsAliquota || 0);
    if (base <= 0 || aliq <= 0) return undefined;
    return {
      base,
      aliquota: aliq,
      valor: arred2((base * aliq) / 100),
      cst: conf.cofinsCST,
      cbenef,
    };
  },
  '02': (ctx) => {
    // Operação tributável - Base de cálculo = valor da operação (alíquota diferenciada)
    return COFINS_STRATEGIES['01'](ctx);
  },
  '03': ({ conf, qtd, cbenef }) => {
    // Operação tributável - Base de cálculo = quantidade vendida x alíquota por unidade de produto
    if (!qtd || !conf.cofinsAliquotaUnidade) return undefined;
    const valor = arred2(Number(conf.cofinsAliquotaUnidade) * qtd);
    return {
      base: 0,
      aliquotaUnidade: Number(conf.cofinsAliquotaUnidade),
      valor,
      cst: conf.cofinsCST,
      cbenef,
      qtdTributada: qtd,
    };
  },
  '04': () => {
    // Operação tributável - Tributação monofásica (alíquota zero)
    return undefined;
  },
  '05': () => {
    // Operação tributável - ST
    return undefined;
  },
  '06': () => {
    // Operação tributável - Alíquota zero
    return undefined;
  },
  '07': () => {
    // Operação isenta da contribuição
    return undefined;
  },
  '08': () => {
    // Operação sem incidência da contribuição
    return undefined;
  },
  '09': () => {
    // Operação com suspensão da contribuição
    return undefined;
  },
  '49': (ctx) => {
    // Outras operações de saída
    return COFINS_STRATEGIES['01'](ctx);
  },
  '50': (ctx) => {
    // Operação com direito a crédito - Vinculada exclusivamente a receita tributada no mercado interno
    return COFINS_STRATEGIES['01'](ctx);
  },
  '51': (ctx) => {
    // Operação com direito a crédito - Vinculada exclusivamente a receita não tributada no mercado interno
    return COFINS_STRATEGIES['01'](ctx);
  },
  '52': (ctx) => {
    // Operação com direito a crédito - Vinculada exclusivamente a receita de exportação
    return COFINS_STRATEGIES['01'](ctx);
  },
  '53': (ctx) => {
    // Operação com direito a crédito - Vinculada a receitas tributadas e não-tributadas no mercado interno
    return COFINS_STRATEGIES['01'](ctx);
  },
  '54': (ctx) => {
    // Operação com direito a crédito - Vinculada a receitas tributadas no mercado interno e de exportação
    return COFINS_STRATEGIES['01'](ctx);
  },
  '55': (ctx) => {
    // Operação com direito a crédito - Vinculada a receitas não-tributadas no mercado interno e de exportação
    return COFINS_STRATEGIES['01'](ctx);
  },
  '56': (ctx) => {
    // Operação com direito a crédito - Vinculada a receitas tributadas e não-tributadas no mercado interno e de exportação
    return COFINS_STRATEGIES['01'](ctx);
  },
  '60': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada exclusivamente a receita tributada no mercado interno
    return COFINS_STRATEGIES['01'](ctx);
  },
  '61': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada exclusivamente a receita não-tributada no mercado interno
    return COFINS_STRATEGIES['01'](ctx);
  },
  '62': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada exclusivamente a receita de exportação
    return COFINS_STRATEGIES['01'](ctx);
  },
  '63': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno
    return COFINS_STRATEGIES['01'](ctx);
  },
  '64': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada a receitas tributadas no mercado interno e de exportação
    return COFINS_STRATEGIES['01'](ctx);
  },
  '65': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada a receitas não-tributadas no mercado interno e de exportação
    return COFINS_STRATEGIES['01'](ctx);
  },
  '66': (ctx) => {
    // Crédito presunto - Operação de aquisição vinculada a receitas tributadas e não-tributadas no mercado interno e de exportação
    return COFINS_STRATEGIES['01'](ctx);
  },
  '67': (ctx) => {
    // Crédito presunto - Outras operações
    return COFINS_STRATEGIES['01'](ctx);
  },
  '70': (ctx) => {
    // Operação de aquisição sem direito a crédito
    return COFINS_STRATEGIES['01'](ctx);
  },
  '71': (ctx) => {
    // Operação de aquisição com isenção
    return COFINS_STRATEGIES['01'](ctx);
  },
  '72': (ctx) => {
    // Operação de aquisição com suspensão
    return COFINS_STRATEGIES['01'](ctx);
  },
  '73': (ctx) => {
    // Operação de aquisição a alíquota zero
    return COFINS_STRATEGIES['01'](ctx);
  },
  '74': (ctx) => {
    // Operação de aquisição sem incidência da contribuição
    return COFINS_STRATEGIES['01'](ctx);
  },
  '75': (ctx) => {
    // Operação de aquisição por substituição tributária
    return COFINS_STRATEGIES['01'](ctx);
  },
  '98': (ctx) => {
    // Outras operações de entrada
    return COFINS_STRATEGIES['01'](ctx);
  },
  '99': (ctx) => {
    // Outras operações
    return COFINS_STRATEGIES['01'](ctx);
  },
  DEFAULT: (ctx) => COFINS_STRATEGIES['01'](ctx),
};
