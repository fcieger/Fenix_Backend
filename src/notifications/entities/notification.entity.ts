import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; // 'credito', 'proposta', 'aprovacao', etc

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  mensagem: string;

  @Column({ type: 'text', nullable: true })
  link: string;

  @Column({ type: 'boolean', default: false })
  lida: boolean;

  @Column({ name: 'lida_em', type: 'timestamp', nullable: true })
  lidaEm: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}




