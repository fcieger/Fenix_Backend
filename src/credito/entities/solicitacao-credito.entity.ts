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
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { DocumentoCredito } from './documento-credito.entity';
import { AnaliseCredito } from './analise-credito.entity';
import { PropostaCredito } from './proposta-credito.entity';
import { CapitalGiro } from './capital-giro.entity';

@Entity('solicitacoes_credito')
export class SolicitacaoCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  // Dados da Solicitação
  @Column({ name: 'valor_solicitado', type: 'decimal', precision: 15, scale: 2 })
  valorSolicitado: number;

  @Column({ type: 'text' })
  finalidade: string;

  @Column({ name: 'tipo_garantia', type: 'varchar', length: 100, nullable: true })
  tipoGarantia: string;

  @Column({ name: 'descricao_garantia', type: 'text', nullable: true })
  descricaoGarantia: string;

  // Dados Complementares
  @Column({ name: 'faturamento_medio', type: 'decimal', precision: 15, scale: 2, nullable: true })
  faturamentoMedio: number;

  @Column({ name: 'tempo_atividade_anos', type: 'integer', nullable: true })
  tempoAtividadeAnos: number;

  @Column({ name: 'numero_funcionarios', type: 'integer', nullable: true })
  numeroFuncionarios: number;

  @Column({ name: 'possui_restricoes', type: 'boolean', default: false })
  possuiRestricoes: boolean;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  // Status e Controle
  @Column({ type: 'varchar', length: 50, default: 'em_analise' })
  status: string;

  @Column({ name: 'motivo_reprovacao', type: 'text', nullable: true })
  motivoReprovacao: string;

  @Column({ name: 'data_aprovacao', type: 'timestamp', nullable: true })
  dataAprovacao: Date;

  @Column({ name: 'data_reprovacao', type: 'timestamp', nullable: true })
  dataReprovacao: Date;

  @Column({ name: 'aprovado_por', type: 'uuid', nullable: true })
  aprovadoPor: string;

  // Relacionamentos
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'aprovado_por' })
  aprovador: User;

  @OneToMany(() => DocumentoCredito, (documento) => documento.solicitacao)
  documentos: DocumentoCredito[];

  @OneToMany(() => AnaliseCredito, (analise) => analise.solicitacao)
  analises: AnaliseCredito[];

  @OneToMany(() => PropostaCredito, (proposta) => proposta.solicitacao)
  propostas: PropostaCredito[];

  @OneToMany(() => CapitalGiro, (capital) => capital.solicitacao)
  capitaisGiro: CapitalGiro[];

  // Auditoria
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Métodos auxiliares
  tempoEmAnalise(): number {
    const agora = new Date();
    const inicio = this.createdAt;
    const diff = agora.getTime() - inicio.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)); // dias
  }

  podeSerCancelada(): boolean {
    return ['em_analise', 'aguardando_documentos', 'documentacao_completa'].includes(this.status);
  }

  estaAprovada(): boolean {
    return this.status === 'aprovado' || this.status === 'proposta_enviada';
  }
}



