import {
  StatusPedido,
  TipoFrete,
  IndicadorPresenca,
  FormaPagamento,
  TipoEstoque,
} from '../enums/pedido-venda.enums';

export class EnumHelper {
  static readonly STATUS_LABELS = {
    [StatusPedido.PENDENTE]: 'Pendente',
    [StatusPedido.APROVADO]: 'Aprovado',
    [StatusPedido.EM_PREPARACAO]: 'Em Preparação',
    [StatusPedido.ENVIADO]: 'Enviado',
    [StatusPedido.ENTREGUE]: 'Entregue',
    [StatusPedido.FATURADO]: 'Faturado',
    [StatusPedido.CANCELADO]: 'Cancelado',
    [StatusPedido.DEVOLVIDO]: 'Devolvido',
  };

  static readonly FRETE_LABELS = {
    [TipoFrete.EMITENTE]: 'Por conta do emitente',
    [TipoFrete.DESTINATARIO]: 'Por conta do destinatário',
    [TipoFrete.TERCEIROS]: 'Por conta de terceiros',
    [TipoFrete.SEM_FRETE]: 'Sem cobrança de frete',
  };

  static readonly PRESENCA_LABELS = {
    [IndicadorPresenca.NAO_APLICA]: 'Não se aplica',
    [IndicadorPresenca.PRESENCIAL]: 'Presencial',
    [IndicadorPresenca.INTERNET]: 'Internet',
    [IndicadorPresenca.TELEATENDIMENTO]: 'Teleatendimento',
    [IndicadorPresenca.NFCe_DOMICILIO]: 'NFCe entrega em domicílio',
    [IndicadorPresenca.PRESENCIAL_FORA]: 'Presencial fora do estabelecimento',
    [IndicadorPresenca.OUTROS]: 'Outros',
  };

  static readonly PAGAMENTO_LABELS = {
    [FormaPagamento.DINHEIRO]: 'Dinheiro',
    [FormaPagamento.CHEQUE]: 'Cheque',
    [FormaPagamento.CARTAO_CREDITO]: 'Cartão de Crédito',
    [FormaPagamento.CARTAO_DEBITO]: 'Cartão de Débito',
    [FormaPagamento.CARTAO_LOJA]: 'Cartão da Loja',
    [FormaPagamento.VALE_ALIMENTACAO]: 'Vale Alimentação',
    [FormaPagamento.VALE_REFEICAO]: 'Vale Refeição',
    [FormaPagamento.VALE_PRESENTE]: 'Vale Presente',
    [FormaPagamento.VALE_COMBUSTIVEL]: 'Vale Combustível',
    [FormaPagamento.BOLETO_BANCARIO]: 'Boleto Bancário',
    [FormaPagamento.SEM_PAGAMENTO]: 'Sem pagamento',
    [FormaPagamento.OUTROS]: 'Outros',
  };

  static readonly ESTOQUE_LABELS = {
    [TipoEstoque.PRINCIPAL]: 'Principal',
    [TipoEstoque.RESERVA]: 'Reserva',
    [TipoEstoque.EXIBICAO]: 'Exibição',
    [TipoEstoque.CONSIGNACAO]: 'Consignação',
    [TipoEstoque.OUTROS]: 'Outros',
  };

  // Métodos genéricos
  static getLabel(value: number, labels: Record<number, string>): string {
    return labels[value] || 'Desconhecido';
  }

  static getColor(status: number): string {
    const colors = {
      [StatusPedido.PENDENTE]: 'yellow',
      [StatusPedido.APROVADO]: 'blue',
      [StatusPedido.EM_PREPARACAO]: 'orange',
      [StatusPedido.ENVIADO]: 'purple',
      [StatusPedido.ENTREGUE]: 'green',
      [StatusPedido.FATURADO]: 'emerald',
      [StatusPedido.CANCELADO]: 'red',
      [StatusPedido.DEVOLVIDO]: 'gray',
    };
    return colors[status] || 'gray';
  }
}
