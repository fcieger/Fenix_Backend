import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PropostaCredito } from './proposta-credito.entity';
import { User } from '../../users/entities/user.entity';

@Entity('visualizacoes_proposta')
export class VisualizacaoProposta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'proposta_id', type: 'uuid' })
  propostaId: string;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  // Relacionamentos
  @ManyToOne(() => PropostaCredito, (proposta) => proposta.visualizacoes)
  @JoinColumn({ name: 'proposta_id' })
  proposta: PropostaCredito;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  // Auditoria
  @CreateDateColumn({ name: 'data_visualizacao' })
  dataVisualizacao: Date;
}



