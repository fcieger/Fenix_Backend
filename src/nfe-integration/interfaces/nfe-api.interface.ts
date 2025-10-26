// Interfaces para comunicação com a API NFe externa

export interface NFeApiRequest {
  empresaId: string;
  numeroNfe: number;
  serie: number;
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO';
  estado: string;
  priority: 'NORMAL' | 'ALTA' | 'BAIXA';
  naturezaOperacao: string;
  dataEmissao: string;
  dataSaidaEntrada: string;
  tipoNfe: number; // 0=Saída, 1=Entrada
  formaPagamento: number;
  formaEmissao: number;
  finalidade: number;
  consumidorFinal: boolean;
  presenca: number;
  emitente: EmitenteRequest;
  destinatario: DestinatarioRequest;
  itens: ItemRequest[];
  transporte?: TransporteRequest;
  cobranca?: CobrancaRequest;
  informacoesAdicionais?: InformacoesAdicionaisRequest;
  observacoes?: string;
}

export interface EmitenteRequest {
  cnpj: string;
  nome: string;
  fantasia?: string;
  ie: string;
  im?: string;
  endereco: EnderecoRequest;
  contato: ContatoRequest;
}

export interface DestinatarioRequest {
  cnpjCpf: string;
  nome: string;
  endereco: EnderecoRequest;
  ie?: string;
  email?: string;
}

export interface ItemRequest {
  numeroItem: number;
  codigoProduto: string;
  descricaoProduto: string;
  ncm: string;
  cfop: string;
  unidadeComercial: string;
  quantidadeComercial: number;
  valorUnitarioComercial: number;
  valorTotalProduto: number;
  unidadeTributavel?: string;
  quantidadeTributavel?: number;
  valorUnitarioTributavel?: number;
  indicadorTotal: number;
}

export interface TransporteRequest {
  modalidadeFrete: number;
  transportadora?: TransportadoraRequest;
  veiculo?: VeiculoRequest;
  volumes?: VolumeRequest[];
}

export interface TransportadoraRequest {
  cnpjCpf: string;
  nome: string;
  ie?: string;
  endereco: EnderecoRequest;
}

export interface VeiculoRequest {
  placa: string;
  uf: string;
  rntc?: string;
}

export interface VolumeRequest {
  quantidade: number;
  especie: string;
  marca?: string;
  numeracao?: string;
  pesoBruto?: number;
  pesoLiquido?: number;
  volume?: number;
}

export interface CobrancaRequest {
  duplicata: DuplicataRequest;
}

export interface DuplicataRequest {
  numero: string;
  dataVencimento: string;
  valor: number;
}

export interface InformacoesAdicionaisRequest {
  informacoesAdicionais?: string;
  informacoesComplementares?: string;
}

export interface EnderecoRequest {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  codigoMunicipio: string;
  nomeMunicipio: string;
  uf: string;
  cep: string;
  codigoPais: string;
  nomePais: string;
  telefone?: string;
}

export interface ContatoRequest {
  telefone?: string;
  email?: string;
}

export interface NFeApiResponse {
  id: string;
  empresaId: string;
  chaveAcesso: string;
  numeroNfe: number;
  serie: number;
  status: 'RASCUNHO' | 'PROCESSANDO' | 'AUTORIZADA' | 'REJEITADA' | 'CANCELADA';
  dataEmissao: string;
  dataAutorizacao?: string;
  protocoloAutorizacao?: string;
  xmlNfe?: string;
  xmlRetorno?: string;
  erros?: ErroNFe[];
  // Propriedades adicionais para compatibilidade
  xml?: string;
  pdf?: string;
  danfe?: string;
  data?: any;
}

export interface ErroNFe {
  codigo: string;
  descricao: string;
  severidade: 'ERRO' | 'AVISO' | 'INFO';
}

export interface WebhookNFeData {
  nfeId: string;
  empresaId: string;
  chaveAcesso: string;
  status: string;
  dataAtualizacao: string;
  xmlNfe?: string;
  protocoloAutorizacao?: string;
  erros?: ErroNFe[];
}
