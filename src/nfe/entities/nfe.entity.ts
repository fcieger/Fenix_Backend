import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { NfeStatus } from '../enums/nfe-status.enum';
import { TipoOperacao } from '../enums/tipo-operacao.enum';
import { Finalidade } from '../enums/finalidade.enum';
import { Ambiente } from '../enums/ambiente.enum';
import { ModalidadeFrete } from '../enums/modalidade-frete.enum';
import { FormaPagamento } from '../enums/forma-pagamento.enum';
import { MeioPagamento } from '../enums/meio-pagamento.enum';
import { IndicadorPresenca } from '../enums/indicador-presenca.enum';
import { IndicadorIE } from '../enums/indicador-ie.enum';
import { NfeItem } from './nfe-item.entity';
import { NfeDuplicata } from './nfe-duplicata.entity';

@Entity('nfe')
export class Nfe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  companyId: string;

  @Column('varchar', { length: 9 })
  numeroNfe: string;

  @Column('varchar', { length: 3 })
  serie: string;

  @Column('varchar', { length: 2 })
  modelo: string; // 55=NFe, 65=NFCe

  @Column('uuid')
  configuracaoNfeId: string;

  @Column('varchar', { length: 44, nullable: true })
  chaveAcesso: string;

  @Column({
    type: 'enum',
    enum: NfeStatus,
    default: NfeStatus.RASCUNHO,
  })
  status: NfeStatus;

  @Column({
    type: 'enum',
    enum: Ambiente,
  })
  ambiente: Ambiente;

  @Column({
    type: 'enum',
    enum: TipoOperacao,
  })
  tipoOperacao: TipoOperacao;

  @Column({
    type: 'enum',
    enum: Finalidade,
  })
  finalidade: Finalidade;

  @Column('uuid')
  naturezaOperacaoId: string;

  @Column('boolean')
  consumidorFinal: boolean;

  @Column({
    type: 'enum',
    enum: IndicadorPresenca,
  })
  indicadorPresenca: IndicadorPresenca;

  // Dados do destinatário
  @Column('uuid', { nullable: true })
  destinatarioId: string;

  @Column('varchar', { length: 1 })
  destinatarioTipo: string; // F=CPF, J=CNPJ

  @Column('varchar', { length: 14 })
  destinatarioCnpjCpf: string;

  @Column('varchar', { length: 60 })
  destinatarioRazaoSocial: string;

  @Column('varchar', { length: 60, nullable: true })
  destinatarioNomeFantasia: string;

  @Column('varchar', { length: 14, nullable: true })
  destinatarioIE: string;

  @Column('varchar', { length: 15, nullable: true })
  destinatarioIM: string;

  @Column({
    type: 'enum',
    enum: IndicadorIE,
    nullable: true,
  })
  destinatarioIndicadorIE: IndicadorIE;

  // Endereço do destinatário
  @Column('varchar', { length: 60 })
  destinatarioLogradouro: string;

  @Column('varchar', { length: 10 })
  destinatarioNumero: string;

  @Column('varchar', { length: 60, nullable: true })
  destinatarioComplemento: string;

  @Column('varchar', { length: 60 })
  destinatarioBairro: string;

  @Column('varchar', { length: 60 })
  destinatarioMunicipio: string;

  @Column('varchar', { length: 2 })
  destinatarioUF: string;

  @Column('varchar', { length: 8 })
  destinatarioCEP: string;

  @Column('varchar', { length: 7, nullable: true })
  destinatarioCodigoMunicipio: string;

  @Column('varchar', { length: 60, default: 'Brasil' })
  destinatarioPais: string;

  @Column('varchar', { length: 4, default: '1058' })
  destinatarioCodigoPais: string;

  @Column('varchar', { length: 20, nullable: true })
  destinatarioTelefone: string;

  @Column('varchar', { length: 60, nullable: true })
  destinatarioEmail: string;

  // Datas
  @Column('timestamp')
  dataEmissao: Date;

  @Column('timestamp', { nullable: true })
  dataSaida: Date;

  @Column('time', { nullable: true })
  horaSaida: string;

  @Column('timestamp', { nullable: true })
  dataAutorizacao: Date;

  @Column('timestamp', { nullable: true })
  dataCancelamento: Date;

  @Column('text', { nullable: true })
  justificativaCancelamento: string;

  // Valores totais
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorTotalProdutos: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  baseCalculoICMS: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorICMS: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  baseCalculoICMSST: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorICMSST: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorFrete: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorSeguro: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorDesconto: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  outrasDespesas: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorIPI: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorPIS: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorCOFINS: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  tributosAproximados: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorTotalNota: number;

  // Transporte
  @Column({
    type: 'enum',
    enum: ModalidadeFrete,
    nullable: true,
  })
  modalidadeFrete: ModalidadeFrete;

  @Column('boolean', { default: false })
  incluirFreteTotal: boolean;

  @Column('uuid', { nullable: true })
  transportadoraId: string;

  // Dados da transportadora (opcional)
  @Column('varchar', { length: 60, nullable: true })
  transportadoraNome: string;

  @Column('varchar', { length: 14, nullable: true })
  transportadoraCnpj: string;

  @Column('varchar', { length: 14, nullable: true })
  transportadoraIE: string;

  @Column('varchar', { length: 7, nullable: true })
  veiculoPlaca: string;

  @Column('varchar', { length: 2, nullable: true })
  veiculoUF: string;

  // Volumes (JSONB)
  @Column('jsonb', { nullable: true })
  volumes: any[];

  // Pagamento
  @Column({
    type: 'enum',
    enum: FormaPagamento,
    nullable: true,
  })
  formaPagamento: FormaPagamento;

  @Column({
    type: 'enum',
    enum: MeioPagamento,
    nullable: true,
  })
  meioPagamento: MeioPagamento;

  // Informações adicionais
  @Column('text', { nullable: true })
  informacoesComplementares: string;

  @Column('text', { nullable: true })
  informacoesFisco: string;

  @Column('varchar', { length: 15, nullable: true })
  numeroPedido: string;

  // XMLs (nullable)
  @Column('text', { nullable: true })
  xmlNfe: string;

  @Column('text', { nullable: true })
  xmlRetorno: string;

  @Column('varchar', { length: 15, nullable: true })
  protocoloAutorizacao: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos
  @OneToMany(() => NfeItem, (item) => item.nfe, { cascade: true })
  itens: NfeItem[];

  @OneToMany(() => NfeDuplicata, (duplicata) => duplicata.nfe, { cascade: true })
  duplicatas: NfeDuplicata[];
}

