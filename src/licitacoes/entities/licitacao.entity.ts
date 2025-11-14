import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ModalidadeLicitacao {
  PREGAO_ELETRONICO = 'Pregão Eletrônico',
  PREGAO_PRESENCIAL = 'Pregão Presencial',
  CONCORRENCIA = 'Concorrência',
  TOMADA_PRECOS = 'Tomada de Preços',
  CONVITE = 'Convite',
  DISPENSA = 'Dispensa de Licitação',
  INEXIGIBILIDADE = 'Inexigibilidade',
}

export enum EsferaLicitacao {
  FEDERAL = 'Federal',
  ESTADUAL = 'Estadual',
  MUNICIPAL = 'Municipal',
}

export enum StatusLicitacao {
  ABERTA = 'Aberta',
  ENCERRADA = 'Encerrada',
  HOMOLOGADA = 'Homologada',
  CANCELADA = 'Cancelada',
  DESERTA = 'Deserta',
  FRACASSADA = 'Fracassada',
}

@Entity('licitacoes')
@Index(['numeroProcesso', 'fonte'])
@Index(['status', 'dataAbertura'])
@Index(['estado', 'municipio'])
@Index(['cnae'])
export class Licitacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  numeroProcesso: string;

  @Column()
  titulo: string;

  @Column('text')
  descricao: string;

  @Column()
  orgao: string;

  @Column({ nullable: true })
  orgaoSigla: string;

  @Column({
    type: 'varchar',
  })
  modalidade: string;

  @Column({
    type: 'varchar',
  })
  esfera: string;

  @Column({ length: 2 })
  @Index()
  estado: string;

  @Column({ nullable: true })
  municipio: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  valorEstimado: number;

  @Column({ type: 'date' })
  dataAbertura: Date;

  @Column({ type: 'date', nullable: true })
  dataLimite: Date;

  @Column({ type: 'varchar' })
  @Index()
  status: string;

  @Column({ nullable: true, type: 'text' })
  linkEdital: string;

  @Column({ nullable: true, type: 'text' })
  linkSistema: string;

  @Column({ nullable: true })
  cnae: string;

  @Column('simple-array', { nullable: true })
  categorias: string[];

  @Column('simple-array', { nullable: true })
  palavrasChave: string[];

  @Column()
  @Index()
  fonte: string;

  @Column({ nullable: true })
  @Index()
  idExterno: string;

  @Column({ type: 'jsonb', nullable: true })
  dadosOriginais: any;

  @Column({ default: 0 })
  visualizacoes: number;

  @Column({ nullable: true })
  contato: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  telefone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  sincronizadoEm: Date;
}



