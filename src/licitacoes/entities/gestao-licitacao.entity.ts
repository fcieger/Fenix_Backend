import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Licitacao } from './licitacao.entity';

export enum StatusGestao {
  ANALISANDO = 'analisando',
  PREPARANDO_PROPOSTA = 'preparando_proposta',
  PROPOSTA_ENVIADA = 'proposta_enviada',
  DESCARTADO = 'descartado',
}

export enum ResultadoLicitacao {
  VENCEDOR = 'vencedor',
  PERDEDOR = 'perdedor',
  DESERTA = 'deserta',
  FRACASSADA = 'fracassada',
}

@Entity('gestao_licitacoes')
export class GestaoLicitacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Licitacao)
  @JoinColumn()
  licitacao: Licitacao;

  @Column()
  licitacaoId: string;

  @Column({ nullable: true })
  companyId: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ default: false })
  favorito: boolean;

  @Column({ default: false })
  interesseManifestado: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  statusInterno: string;

  @Column('text', { nullable: true })
  anotacoes: string;

  // Documentos
  @Column({ nullable: true })
  urlProposta: string;

  @Column('simple-array', { nullable: true })
  urlsCertificados: string[];

  @Column('simple-array', { nullable: true })
  urlsHabilitacao: string[];

  // Timeline
  @Column('jsonb', { nullable: true })
  timeline: Array<{
    data: Date;
    acao: string;
    usuario: string;
    detalhes?: string;
  }>;

  // Resultado
  @Column({ type: 'varchar', nullable: true })
  resultado: string;

  @Column('decimal', { precision: 15, scale: 2, nullable: true })
  valorContratado: number;

  @Column({ type: 'date', nullable: true })
  dataResultado: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



