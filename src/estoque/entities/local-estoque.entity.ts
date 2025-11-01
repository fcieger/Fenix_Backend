import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('locais_estoque')
export class LocalEstoque {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ nullable: true })
  codigo?: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}


