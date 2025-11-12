import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('alertas_licitacao')
export class AlertaLicitacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ default: true })
  ativo: boolean;

  // Critérios de busca
  @Column('simple-array', { nullable: true })
  estados: string[];

  @Column('simple-array', { nullable: true })
  municipios: string[];

  @Column('simple-array', { nullable: true })
  modalidades: string[];

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valorMinimo: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  valorMaximo: number;

  @Column('simple-array', { nullable: true })
  cnae: string[];

  @Column('simple-array', { nullable: true })
  palavrasChave: string[];

  @Column({ default: false })
  apenasAbertas: boolean;

  @Column({ nullable: true })
  diasAntesEncerramento: number;

  // Notificações
  @Column({ default: true })
  notificarEmail: boolean;

  @Column({ default: false })
  notificarPush: boolean;

  @Column({ default: false })
  notificarWhatsApp: boolean;

  // Frequência
  @Column({
    type: 'varchar',
    default: 'diaria',
  })
  frequencia: string;

  @Column({ nullable: true })
  horarioNotificacao: string;

  @Column({ type: 'timestamp', nullable: true })
  ultimaNotificacao: Date;

  @Column({ default: 0 })
  totalNotificacoes: number;

  @Column({ nullable: true })
  companyId: string;

  @Column({ nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


