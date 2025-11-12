import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { SolicitacaoCredito } from './solicitacao-credito.entity';

@Entity('antecipacao_recebiveis')
export class AntecipacaoRecebiveis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'solicitacao_id', type: 'uuid', nullable: true })
  solicitacaoId: string;

  // Valores
  @Column({ name: 'valor_total_recebiveis', type: 'decimal', precision: 15, scale: 2 })
  valorTotalRecebiveis: number;

  @Column({ name: 'valor_antecipado', type: 'decimal', precision: 15, scale: 2 })
  valorAntecipado: number;

  @Column({ name: 'taxa_desconto', type: 'decimal', precision: 5, scale: 2 })
  taxaDesconto: number;

  @Column({ name: 'valor_liquido', type: 'decimal', precision: 15, scale: 2 })
  valorLiquido: number;

  // Recebíveis
  @Column({ name: 'quantidade_titulos', type: 'integer', nullable: true })
  quantidadeTitulos: number;

  @Column({ name: 'data_vencimento_original', type: 'date', nullable: true })
  dataVencimentoOriginal: Date;

  @Column({ name: 'data_antecipacao', type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  dataAntecipacao: Date;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'pendente' })
  status: string;

  // Relacionamentos
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @ManyToOne(() => SolicitacaoCredito)
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: SolicitacaoCredito;

  // Auditoria
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Métodos auxiliares
  estaPendente(): boolean {
    return this.status === 'pendente';
  }

  estaAprovado(): boolean {
    return this.status === 'aprovado';
  }

  estaLiberado(): boolean {
    return this.status === 'liberado';
  }

  calcularDesconto(): number {
    return this.valorTotalRecebiveis - this.valorLiquido;
  }

  percentualDesconto(): number {
    return (this.calcularDesconto() / this.valorTotalRecebiveis) * 100;
  }

  prazoMedio(): number | null {
    if (!this.dataVencimentoOriginal) return null;
    const diff = new Date(this.dataVencimentoOriginal).getTime() - new Date().getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

