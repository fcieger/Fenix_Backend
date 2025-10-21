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
import { Cadastro } from '../../cadastros/entities/cadastro.entity';
import { NaturezaOperacao } from '../../natureza-operacao/entities/natureza-operacao.entity';
import { PrazoPagamento } from '../../prazos-pagamento/entities/prazo-pagamento.entity';
import { Company } from '../../companies/entities/company.entity';
import { PedidoVendaItem } from './pedido-venda-item.entity';
import { 
  StatusPedido, 
  TipoFrete, 
  IndicadorPresenca, 
  FormaPagamento, 
  TipoEstoque 
} from '../../shared/enums/pedido-venda.enums';
import { EnumHelper } from '../../shared/helpers/enum.helpers';

@Entity('pedidos_venda')
export class PedidoVenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Informações Básicas
  @Column()
  numeroPedido: string;

  @Column({ nullable: true })
  numeroNFe: string;

  @Column({ type: 'date' })
  dataEmissao: Date;

  @Column({ type: 'date', nullable: true })
  dataPrevisao: Date;

  @Column({ type: 'date', nullable: true })
  dataEntrega: Date;

  @Column()
  numeroOrdemCompra: string;

  // Relacionamentos
  @ManyToOne(() => Cadastro, { eager: true })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cadastro;

  @Column({ type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cadastro, { eager: true, nullable: true })
  @JoinColumn({ name: 'vendedorId' })
  vendedor: Cadastro;

  @Column({ type: 'uuid', nullable: true })
  vendedorId: string;

  @ManyToOne(() => Cadastro, { eager: true, nullable: true })
  @JoinColumn({ name: 'transportadoraId' })
  transportadora: Cadastro;

  @Column({ type: 'uuid', nullable: true })
  transportadoraId: string;

  @ManyToOne(() => NaturezaOperacao, { eager: true })
  @JoinColumn({ name: 'naturezaOperacaoId' })
  naturezaOperacao: NaturezaOperacao;

  @Column({ type: 'uuid' })
  naturezaOperacaoId: string;

  @ManyToOne(() => PrazoPagamento, { eager: true, nullable: true })
  @JoinColumn({ name: 'prazoPagamentoId' })
  prazoPagamento: PrazoPagamento;

  @Column({ type: 'uuid', nullable: true })
  prazoPagamentoId: string;

  // Configurações
  @Column({ default: false })
  consumidorFinal: boolean;

  @Column({ type: 'int', default: IndicadorPresenca.INTERNET })
  indicadorPresenca: IndicadorPresenca;

  @Column({ type: 'int', default: FormaPagamento.BOLETO_BANCARIO })
  formaPagamento: FormaPagamento;

  @Column()
  parcelamento: string;

  @Column({ type: 'int', default: TipoEstoque.PRINCIPAL })
  estoque: TipoEstoque;

  @Column({ nullable: true })
  listaPreco: string;

  // Frete
  @Column({ type: 'int', default: TipoFrete.EMITENTE })
  frete: TipoFrete;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorFrete: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  despesas: number;

  @Column({ default: false })
  incluirFreteTotal: boolean;

  // Dados do Veículo
  @Column({ nullable: true })
  placaVeiculo: string;

  @Column({ nullable: true })
  ufPlaca: string;

  @Column({ nullable: true })
  rntc: string;

  // Dados de Volume e Peso
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pesoLiquido: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pesoBruto: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  volume: number;

  @Column({ type: 'int', nullable: true })
  quantidadeVolumes: number;

  @Column({ nullable: true })
  especie: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  numeracao: string;

  // Totais
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDescontos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalImpostos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalProdutos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPedido: number;

  // Status e Controle
  @Column({ type: 'int', default: StatusPedido.PENDENTE })
  status: StatusPedido;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.pedidosVenda)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Relacionamento com Itens
  @OneToMany(() => PedidoVendaItem, item => item.pedidoVenda, { cascade: true })
  itens: PedidoVendaItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos helper para labels
  get statusLabel(): string {
    return EnumHelper.getLabel(this.status, EnumHelper.STATUS_LABELS);
  }

  get freteLabel(): string {
    return EnumHelper.getLabel(this.frete, EnumHelper.FRETE_LABELS);
  }

  get presencaLabel(): string {
    return EnumHelper.getLabel(this.indicadorPresenca, EnumHelper.PRESENCA_LABELS);
  }

  get pagamentoLabel(): string {
    return EnumHelper.getLabel(this.formaPagamento, EnumHelper.PAGAMENTO_LABELS);
  }

  get estoqueLabel(): string {
    return EnumHelper.getLabel(this.estoque, EnumHelper.ESTOQUE_LABELS);
  }

  get statusColor(): string {
    return EnumHelper.getColor(this.status);
  }
}
