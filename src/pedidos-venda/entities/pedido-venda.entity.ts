import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Company } from '../../companies/entities/company.entity';
import { Cadastro } from '../../cadastros/entities/cadastro.entity';
import { PrazoPagamento } from '../../prazos-pagamento/entities/prazo-pagamento.entity';
import { NaturezaOperacao } from '../../natureza-operacao/entities/natureza-operacao.entity';
import { FormaPagamento } from '../../formas-pagamento/entities/forma-pagamento.entity';
import { LocalEstoque } from '../../estoque/entities/local-estoque.entity';
import { Orcamento } from '../../orcamentos/entities/orcamento.entity';
import { PedidoVendaItem } from './pedido-venda-item.entity';

export enum StatusPedidoVenda {
  RASCUNHO = 'rascunho',
  PENDENTE = 'pendente',
  EM_PREPARACAO = 'em_preparacao',
  ENVIADO = 'enviado',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado',
  FATURADO = 'faturado',
}

@Entity('pedidos_venda')
export class PedidoVenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Identificação
  @Column({ nullable: true })
  numero: string;

  @Column({ nullable: true })
  serie: string;

  @Column({ nullable: true })
  numeroOrdemCompra: string;

  // Vínculo com orçamento
  @ManyToOne(() => Orcamento, { nullable: true, eager: false })
  @JoinColumn({ name: 'orcamentoId' })
  orcamento?: Orcamento;

  @Column({ type: 'uuid', nullable: true })
  orcamentoId?: string;

  // Datas
  @Column({ type: 'date' })
  dataEmissao: Date;

  @Column({ type: 'date', nullable: true })
  dataPrevisaoEntrega: Date;

  @Column({ type: 'date', nullable: true })
  dataEntrega: Date;

  // Relacionamentos principais
  @ManyToOne(() => Cadastro, { eager: true })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cadastro;

  @Column({ type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cadastro, { eager: true, nullable: true })
  @JoinColumn({ name: 'vendedorId' })
  vendedor?: Cadastro;

  @Column({ type: 'uuid', nullable: true })
  vendedorId?: string;

  @ManyToOne(() => Cadastro, { eager: true, nullable: true })
  @JoinColumn({ name: 'transportadoraId' })
  transportadora?: Cadastro;

  @Column({ type: 'uuid', nullable: true })
  transportadoraId?: string;

  @ManyToOne(() => PrazoPagamento, { eager: true, nullable: true })
  @JoinColumn({ name: 'prazoPagamentoId' })
  prazoPagamento?: PrazoPagamento;

  @Column({ type: 'uuid', nullable: true })
  prazoPagamentoId?: string;

  // Natureza padrão no cabeçalho (item pode sobrepor)
  @ManyToOne(() => NaturezaOperacao, { eager: true, nullable: true })
  @JoinColumn({ name: 'naturezaOperacaoPadraoId' })
  naturezaOperacaoPadrao?: NaturezaOperacao;

  @Column({ type: 'uuid', nullable: true })
  naturezaOperacaoPadraoId?: string;

  // Pagamento
  @ManyToOne(() => FormaPagamento, { nullable: true, eager: true })
  @JoinColumn({ name: 'formaPagamentoId' })
  formaPagamento?: FormaPagamento;

  @Column({ type: 'uuid', nullable: true })
  formaPagamentoId?: string;

  @Column({ nullable: true })
  parcelamento?: string;

  @Column({ nullable: true })
  consumidorFinal?: boolean;

  @Column({ nullable: true })
  indicadorPresenca?: string;

  @ManyToOne(() => LocalEstoque, { nullable: true, eager: true })
  @JoinColumn({ name: 'localEstoqueId' })
  localEstoque?: LocalEstoque;

  @Column({ type: 'uuid', nullable: true })
  localEstoqueId?: string;

  @Column({ nullable: true })
  listaPreco?: string;

  // Frete e despesas
  @Column({ nullable: true })
  frete?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true, default: 0 })
  valorFrete?: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true, default: 0 })
  despesas?: number;

  @Column({ nullable: true })
  incluirFreteTotal?: boolean;

  // Dados do veículo
  @Column({ nullable: true })
  placaVeiculo?: string;

  @Column({ nullable: true })
  ufPlaca?: string;

  @Column({ nullable: true })
  rntc?: string;

  // Dados de volume e peso
  @Column({ type: 'decimal', precision: 14, scale: 3, nullable: true, default: 0 })
  pesoLiquido?: number;

  @Column({ type: 'decimal', precision: 14, scale: 3, nullable: true, default: 0 })
  pesoBruto?: number;

  @Column({ type: 'decimal', precision: 14, scale: 3, nullable: true, default: 0 })
  volume?: number;

  @Column({ nullable: true })
  especie?: string;

  @Column({ nullable: true })
  marca?: string;

  @Column({ nullable: true })
  numeracao?: string;

  @Column({ nullable: true })
  quantidadeVolumes?: number;

  // Totais
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalProdutos: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalDescontos: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalImpostos: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalGeral: number;

  // Observações
  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  // Status
  @Column({ type: 'enum', enum: StatusPedidoVenda, default: StatusPedidoVenda.RASCUNHO })
  status: StatusPedidoVenda;

  // Empresa
  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.id)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Itens
  @OneToMany(() => PedidoVendaItem, (item) => item.pedidoVenda, { cascade: true, eager: false })
  @Expose()
  itens: PedidoVendaItem[];

  // Auditoria
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
