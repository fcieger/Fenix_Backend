export enum StatusPedido {
  PENDENTE = 0,
  APROVADO = 1,
  EM_PREPARACAO = 2,
  ENVIADO = 3,
  ENTREGUE = 4,
  FATURADO = 5,
  CANCELADO = -1,
  DEVOLVIDO = -2
}

export enum TipoFrete {
  EMITENTE = 0,        // 0 - Por conta do emitente
  DESTINATARIO = 1,    // 1 - Por conta do destinatário/remetente
  TERCEIROS = 2,       // 2 - Por conta de terceiros
  SEM_FRETE = 9        // 9 - Sem cobrança de frete
}

export enum IndicadorPresenca {
  NAO_APLICA = 0,      // 0 - Não se aplica
  PRESENCIAL = 1,      // 1 - Presencial
  INTERNET = 2,        // 2 - Internet
  TELEATENDIMENTO = 3, // 3 - Teleatendimento
  NFCe_DOMICILIO = 4,  // 4 - NFCe entrega em domicílio
  PRESENCIAL_FORA = 5, // 5 - Presencial fora do estabelecimento
  OUTROS = 9           // 9 - Outros
}

export enum FormaPagamento {
  DINHEIRO = 1,
  CHEQUE = 2,
  CARTAO_CREDITO = 3,
  CARTAO_DEBITO = 4,
  CARTAO_LOJA = 5,
  VALE_ALIMENTACAO = 10,
  VALE_REFEICAO = 11,
  VALE_PRESENTE = 12,
  VALE_COMBUSTIVEL = 13,
  BOLETO_BANCARIO = 15,
  SEM_PAGAMENTO = 90,
  OUTROS = 99
}

export enum TipoEstoque {
  PRINCIPAL = 1,
  RESERVA = 2,
  EXIBICAO = 3,
  CONSIGNACAO = 4,
  OUTROS = 9
}
