import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../../companies/entities/company.entity';

@Entity('contas_financeiras')
export class ContaFinanceira {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'varchar', length: 255 })
  descricao: string;

  @Column({ type: 'varchar', length: 10 })
  banco_id: string;

  @Column({ type: 'varchar', length: 255 })
  banco_nome: string;

  @Column({ type: 'varchar', length: 10 })
  banco_codigo: string;

  @Column({ type: 'varchar', length: 20 })
  numero_agencia: string;

  @Column({ type: 'varchar', length: 20 })
  numero_conta: string;

  @Column({ type: 'varchar', length: 20 })
  tipo_conta: string;

  @Column({ type: 'varchar', length: 20 })
  tipo_pessoa: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldo_inicial: number;

  @Column({ type: 'date' })
  data_abertura: string;

  @Column({ type: 'varchar', length: 20, default: 'ativo' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

