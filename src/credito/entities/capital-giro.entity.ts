import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SolicitacaoCredito } from './solicitacao-credito.entity';
import { Company } from '../../companies/entities/company.entity';
import { PropostaCredito } from './proposta-credito.entity';
import { MovimentacaoCapitalGiro } from './movimentacao-capital-giro.entity';

@Entity('capital_giro')
export class CapitalGiro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'solicitacao_id', type: 'uuid' })
  solicitacaoId: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'proposta_id', type: 'uuid', nullable: true })
  propostaId: string;

  // Valores
  @Column({ name: 'valor_liberado', type: 'decimal', precision: 15, scale: 2 })
  valorLiberado: number;

  @Column({ name: 'valor_utilizado', type: 'decimal', precision: 15, scale: 2, default: 0 })
  valorUtilizado: number;

  @Column({ name: 'limite_disponivel', type: 'decimal', precision: 15, scale: 2, nullable: true })
  limiteDisponivel: number;

  // Condições
  @Column({ name: 'taxa_juros', type: 'decimal', precision: 5, scale: 2 })
  taxaJuros: number;

  @Column({ name: 'prazo_meses', type: 'integer' })
  prazoMeses: number;

  @Column({ name: 'data_vencimento', type: 'date', nullable: true })
  dataVencimento: Date;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'ativo' })
  status: string;

  // Relacionamentos
  @ManyToOne(() => SolicitacaoCredito, (solicitacao) => solicitacao.capitaisGiro)
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: SolicitacaoCredito;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @ManyToOne(() => PropostaCredito, (proposta) => proposta.capitaisGiro)
  @JoinColumn({ name: 'proposta_id' })
  proposta: PropostaCredito;

  @OneToMany(() => MovimentacaoCapitalGiro, (movimentacao) => movimentacao.capitalGiro)
  movimentacoes: MovimentacaoCapitalGiro[];

  // Auditoria
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Métodos auxiliares
  calcularLimiteDisponivel(): number {
    return this.valorLiberado - this.valorUtilizado;
  }

  temLimiteDisponivel(valor: number): boolean {
    return this.calcularLimiteDisponivel() >= valor;
  }

  percentualUtilizado(): number {
    return (this.valorUtilizado / this.valorLiberado) * 100;
  }

  estaAtivo(): boolean {
    return this.status === 'ativo';
  }

  estaSuspenso(): boolean {
    return this.status === 'suspenso';
  }

  diasParaVencimento(): number | null {
    if (!this.dataVencimento) return null;
    const diff = new Date(this.dataVencimento).getTime() - new Date().getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

