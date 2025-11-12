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
import { User } from '../../users/entities/user.entity';
import { VisualizacaoProposta } from './visualizacao-proposta.entity';
import { CapitalGiro } from './capital-giro.entity';

@Entity('propostas_credito')
export class PropostaCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'solicitacao_id', type: 'uuid' })
  solicitacaoId: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  // Dados da Proposta
  @Column({ name: 'numero_proposta', type: 'varchar', length: 50, unique: true })
  numeroProposta: string;

  @Column({ name: 'instituicao_financeira', type: 'varchar', length: 200 })
  instituicaoFinanceira: string;

  @Column({ name: 'valor_aprovado', type: 'decimal', precision: 15, scale: 2 })
  valorAprovado: number;

  @Column({ name: 'taxa_juros', type: 'decimal', precision: 5, scale: 2 })
  taxaJuros: number;

  @Column({ name: 'taxa_intermediacao', type: 'decimal', precision: 5, scale: 2 })
  taxaIntermediacao: number;

  @Column({ name: 'prazo_meses', type: 'integer' })
  prazoMeses: number;

  // Cálculos
  @Column({ name: 'valor_parcela', type: 'decimal', precision: 15, scale: 2, nullable: true })
  valorParcela: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  cet: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  iof: number;

  @Column({ name: 'valor_total_pagar', type: 'decimal', precision: 15, scale: 2, nullable: true })
  valorTotalPagar: number;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'condicoes_gerais', type: 'text', nullable: true })
  condicoesGerais: string;

  // Status da Proposta
  @Column({ type: 'varchar', length: 50, default: 'enviada' })
  status: string;

  // Aceite/Recusa
  @Column({ name: 'data_aceite', type: 'timestamp', nullable: true })
  dataAceite: Date;

  @Column({ name: 'data_recusa', type: 'timestamp', nullable: true })
  dataRecusa: Date;

  @Column({ name: 'motivo_recusa', type: 'text', nullable: true })
  motivoRecusa: string;

  @Column({ name: 'ip_aceite', type: 'varchar', length: 45, nullable: true })
  ipAceite: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  // Validade
  @Column({ name: 'data_envio', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataEnvio: Date;

  @Column({ name: 'data_expiracao', type: 'timestamp', nullable: true })
  dataExpiracao: Date;

  // Controle
  @Column({ name: 'enviada_por', type: 'uuid', nullable: true })
  enviadaPor: string;

  @Column({ name: 'visualizada_em', type: 'timestamp', nullable: true })
  visualizadaEm: Date;

  // Relacionamentos
  @ManyToOne(() => SolicitacaoCredito, (solicitacao) => solicitacao.propostas)
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: SolicitacaoCredito;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'enviada_por' })
  remetente: User;

  @OneToMany(() => VisualizacaoProposta, (visualizacao) => visualizacao.proposta)
  visualizacoes: VisualizacaoProposta[];

  @OneToMany(() => CapitalGiro, (capital) => capital.proposta)
  capitaisGiro: CapitalGiro[];

  // Auditoria
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Métodos auxiliares
  estaExpirada(): boolean {
    if (!this.dataExpiracao) return false;
    return new Date() > this.dataExpiracao;
  }

  diasParaExpirar(): number | null {
    if (!this.dataExpiracao) return null;
    const diff = this.dataExpiracao.getTime() - new Date().getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  foiAceita(): boolean {
    return this.status === 'aceita';
  }

  foiRecusada(): boolean {
    return this.status === 'recusada';
  }

  aguardandoResposta(): boolean {
    return ['enviada', 'visualizada'].includes(this.status) && !this.estaExpirada();
  }

  calcularCET(): number {
    // Cálculo simplificado do CET (Custo Efetivo Total)
    const taxaMensal = this.taxaJuros + this.taxaIntermediacao;
    const iofPercentual = 0.38; // IOF aproximado
    return taxaMensal + (iofPercentual / this.prazoMeses);
  }

  calcularValorParcela(): number {
    // Cálculo da parcela usando tabela Price
    const taxa = this.taxaJuros / 100;
    const numerador = this.valorAprovado * taxa * Math.pow(1 + taxa, this.prazoMeses);
    const denominador = Math.pow(1 + taxa, this.prazoMeses) - 1;
    return numerador / denominador;
  }

  calcularValorTotal(): number {
    const parcela = this.valorParcela || this.calcularValorParcela();
    return parcela * this.prazoMeses;
  }
}

