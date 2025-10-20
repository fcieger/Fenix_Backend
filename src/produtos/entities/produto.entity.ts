import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ nullable: true })
  apelido?: string;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  descricao?: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ nullable: true })
  tipoProduto?: string;

  @Column({ nullable: true })
  unidadeMedida?: string;

  @Column({ nullable: true })
  marca?: string;

  @Column({ nullable: true })
  referencia?: string;

  @Column({ nullable: true })
  codigoBarras?: string;

  @Column({ nullable: true })
  ncm?: string;

  @Column({ nullable: true })
  cest?: string;

  @Column({ nullable: true })
  tipoProdutoSped?: string;

  @Column({ nullable: true })
  origemProdutoSped?: string;

  @Column({ nullable: true })
  categoriaProduto?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custo?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  preco?: number;

  @Column({ default: false })
  produtoInativo: boolean;

  @Column({ default: false })
  usarApelidoComoNomePrincipal: boolean;

  @Column({ default: false })
  integracaoMarketplace: boolean;

  // Dimensões e Peso
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  peso?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  altura?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  largura?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  profundidade?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pesoLiquido?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pesoBruto?: number;

  // Embalagem
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  alturaEmbalagem?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  larguraEmbalagem?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  profundidadeEmbalagem?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pesoEmbalagem?: number;

  @Column({ type: 'int', nullable: true })
  quantidadePorEmbalagem?: number;

  @Column({ nullable: true })
  tipoEmbalagem?: string;

  // Características Físicas
  @Column({ nullable: true })
  cor?: string;

  @Column({ nullable: true })
  tamanho?: string;

  @Column({ nullable: true })
  material?: string;

  @Column({ nullable: true })
  modelo?: string;

  @Column({ nullable: true })
  voltagem?: string;

  @Column({ nullable: true })
  potencia?: string;

  @Column({ nullable: true })
  capacidade?: string;

  // Garantia e Certificações
  @Column({ type: 'int', nullable: true })
  garantiaMeses?: number;

  @Column({ nullable: true })
  certificacoes?: string;

  @Column({ nullable: true })
  normasTecnicas?: string;

  // Informações Adicionais
  @Column({ nullable: true })
  fabricante?: string;

  @Column({ nullable: true })
  fornecedorPrincipal?: string;

  @Column({ nullable: true })
  paisOrigem?: string;

  @Column({ nullable: true })
  linkFichaTecnica?: string;

  @Column({ type: 'text', nullable: true })
  observacoesTecnicas?: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.produtos)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

