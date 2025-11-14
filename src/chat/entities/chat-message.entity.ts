import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid', { nullable: true })
  companyId: string;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'text' })
  userMessage: string;

  @Column({ type: 'text' })
  aiResponse: string;

  @Column({ type: 'jsonb', nullable: true })
  context: any;

  @Column({ default: 'gpt-4o-mini' })
  model: string;

  @Column({ type: 'int', nullable: true })
  tokensUsed: number;

  @CreateDateColumn()
  createdAt: Date;
}


