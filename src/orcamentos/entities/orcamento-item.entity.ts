import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Orcamento } from './orcamento.entity';
import { Produto } from '../../produtos/entities/produto.entity';
import { NaturezaOperacao } from '../../natureza-operacao/entities/natureza-operacao.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('orcamento_itens')
export class OrcamentoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Orcamento, (orc) => orc.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orcamentoId' })
  orcamento: Orcamento;

  @Column({ type: 'uuid' })
  orcamentoId: string;

  // Empresa
  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  // Produto (opcional - permite item livre)
  @ManyToOne(() => Produto, { eager: true, nullable: true })
  @JoinColumn({ name: 'produtoId' })
  produto?: Produto;

  @Column({ type: 'uuid', nullable: true })
  produtoId?: string;

  // Natureza de operação por item (obrigatória)
  @ManyToOne(() => NaturezaOperacao, { eager: true })
  @JoinColumn({ name: 'naturezaOperacaoId' })
  naturezaOperacao: NaturezaOperacao;

  @Column({ type: 'uuid' })
  naturezaOperacaoId: string;

  // Identificação e descrição do item
  @Column({ nullable: true })
  codigo?: string;

  @Column({ nullable: true })
  nome?: string;

  @Column({ nullable: true })
  unidade?: string;

  // Fiscais do item
  @Column({ nullable: true })
  ncm?: string;

  @Column({ nullable: true })
  cest?: string;

  // Quantidades e valores
  @Column({ type: 'decimal', precision: 14, scale: 6 })
  quantidade: number;

  @Column({ type: 'decimal', precision: 14, scale: 6 })
  precoUnitario: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  descontoValor: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  descontoPercentual: number;

  // Rateios (frete/seguro/outras)
  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  freteRateado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  seguroRateado: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  outrasDespesasRateado: number;

  // Impostos calculados por item
  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  icmsBase?: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  icmsAliquota?: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  icmsValor?: number;

  @Column({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  icmsStBase?: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  icmsStAliquota?: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  icmsStValor?: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  ipiAliquota?: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  ipiValor?: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  pisAliquota?: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  pisValor?: number;

  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  cofinsAliquota?: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, nullable: true })
  cofinsValor?: number;

  // Total do item
  @Column({ type: 'decimal', precision: 14, scale: 2 })
  totalItem: number;

  // Observações
  @Column({ type: 'text', nullable: true })
  observacoes?: string;

  // Auditoria
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



