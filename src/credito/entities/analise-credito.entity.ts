import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SolicitacaoCredito } from './solicitacao-credito.entity';
import { User } from '../../users/entities/user.entity';

@Entity('analises_credito')
export class AnaliseCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'solicitacao_id', type: 'uuid' })
  solicitacaoId: string;

  @Column({ name: 'analista_id', type: 'uuid' })
  analistaId: string;

  // Score e Análise
  @Column({ name: 'score_credito', type: 'integer', nullable: true })
  scoreCredito: number;

  @Column({ name: 'risco_classificacao', type: 'varchar', length: 50, nullable: true })
  riscoClassificacao: string;

  // Análise Detalhada
  @Column({ name: 'parecer_tecnico', type: 'text' })
  parecerTecnico: string;

  @Column({ name: 'valor_aprovado', type: 'decimal', precision: 15, scale: 2, nullable: true })
  valorAprovado: number;

  @Column({ name: 'taxa_juros', type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxaJuros: number;

  @Column({ name: 'prazo_meses', type: 'integer', nullable: true })
  prazoMeses: number;

  // Condições
  @Column({ name: 'condicoes_especiais', type: 'text', nullable: true })
  condicoesEspeciais: string;

  @Column({ name: 'garantias_exigidas', type: 'text', nullable: true })
  garantiasExigidas: string;

  // Status
  @Column({ type: 'varchar', length: 50 })
  status: string;

  // Relacionamentos
  @ManyToOne(() => SolicitacaoCredito, (solicitacao) => solicitacao.analises)
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: SolicitacaoCredito;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'analista_id' })
  analista: User;

  // Auditoria
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Métodos auxiliares
  classificarRisco(): string {
    if (!this.scoreCredito) return 'indefinido';
    if (this.scoreCredito >= 800) return 'baixo';
    if (this.scoreCredito >= 600) return 'medio';
    return 'alto';
  }

  foiAprovado(): boolean {
    return this.status === 'aprovado';
  }
}



