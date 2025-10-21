import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Nfe } from './nfe.entity';

@Entity('nfe_itens')
export class NfeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  nfeId: string;

  @Column('uuid', { nullable: true })
  produtoId: string;

  @Column('int')
  numeroItem: number; // sequencial na nota

  // Dados do produto
  @Column('varchar', { length: 20 })
  codigo: string;

  @Column('varchar', { length: 120 })
  descricao: string;

  @Column('varchar', { length: 8, nullable: true })
  ncm: string;

  @Column('varchar', { length: 7, nullable: true })
  cest: string;

  @Column('varchar', { length: 4 })
  cfop: string;

  @Column('varchar', { length: 6 })
  unidadeComercial: string;

  @Column('varchar', { length: 6 })
  unidadeTributavel: string;

  // Quantidades e valores
  @Column('decimal', { precision: 15, scale: 4 })
  quantidade: number;

  @Column('decimal', { precision: 15, scale: 4 })
  quantidadeTributavel: number;

  @Column('decimal', { precision: 15, scale: 4 })
  valorUnitario: number;

  @Column('decimal', { precision: 15, scale: 4 })
  valorUnitarioTributavel: number;

  @Column('decimal', { precision: 15, scale: 2 })
  valorTotal: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorDesconto: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorFrete: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorSeguro: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  outrasDespesas: number;

  // Impostos (JSONB para flexibilidade)
  @Column('jsonb', { nullable: true })
  impostoICMS: {
    origem: string;
    cst: string;
    modalidadeBC: string;
    baseCalculo: number;
    aliquota: number;
    valor: number;
    baseCalculoST: number;
    aliquotaST: number;
    valorST: number;
    valorSTRetido: number;
    valorSTAnterior: number;
    valorSTPosterior: number;
  };

  @Column('jsonb', { nullable: true })
  impostoIPI: {
    cst: string;
    codigoEnquadramento: string;
    baseCalculo: number;
    aliquota: number;
    valor: number;
  };

  @Column('jsonb', { nullable: true })
  impostoPIS: {
    cst: string;
    baseCalculo: number;
    aliquota: number;
    valor: number;
  };

  @Column('jsonb', { nullable: true })
  impostoCOFINS: {
    cst: string;
    baseCalculo: number;
    aliquota: number;
    valor: number;
  };

  @Column('text', { nullable: true })
  observacoes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => Nfe, (nfe) => nfe.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nfeId' })
  nfe: Nfe;
}
