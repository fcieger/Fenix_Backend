import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PedidoVenda } from './pedido-venda.entity';
import { Produto } from '../../produtos/entities/produto.entity';
import { NaturezaOperacao } from '../../natureza-operacao/entities/natureza-operacao.entity';
import { Company } from '../../companies/entities/company.entity';
import { TipoEstoque } from '../../shared/enums/pedido-venda.enums';

@Entity('pedidos_venda_itens')
export class PedidoVendaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relacionamento com Pedido
  @ManyToOne(() => PedidoVenda, (pedido) => pedido.itens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedidoVendaId' })
  pedidoVenda: PedidoVenda;

  @Column({ type: 'uuid' })
  pedidoVendaId: string;

  // Relacionamento com Produto (opcional - pode ser null para produtos não cadastrados)
  @ManyToOne(() => Produto, { eager: true, nullable: true })
  @JoinColumn({ name: 'produtoId' })
  produto?: Produto;

  @Column({ type: 'uuid', nullable: true })
  produtoId?: string;

  // Relacionamento com Natureza de Operação
  @ManyToOne(() => NaturezaOperacao, { eager: true })
  @JoinColumn({ name: 'naturezaOperacaoId' })
  naturezaOperacao: NaturezaOperacao;

  @Column({ type: 'uuid' })
  naturezaOperacaoId: string;

  // CAMPOS ESPECÍFICOS DO ITEM (podem diferir do produto)
  @Column()
  codigo: string; // Pode ser diferente do produto.sku

  @Column()
  nome: string; // Pode ser diferente do produto.nome

  @Column()
  unidadeMedida: string; // Pode ser diferente do produto.unidadeMedida

  // Quantidades e Valores
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantidade: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  valorUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorDesconto: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentualDesconto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorTotal: number;

  // Configurações específicas do item
  @Column({ type: 'int', default: TipoEstoque.PRINCIPAL })
  estoque: TipoEstoque;

  @Column({ nullable: true })
  ncm: string; // Pode ser diferente do produto.ncm

  @Column({ nullable: true })
  cest: string; // Pode ser diferente do produto.cest

  @Column({ nullable: true })
  numeroOrdem: string;

  @Column({ nullable: true })
  numeroItem: string;

  @Column({ nullable: true })
  codigoBeneficioFiscal: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  // Campos de controle
  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
