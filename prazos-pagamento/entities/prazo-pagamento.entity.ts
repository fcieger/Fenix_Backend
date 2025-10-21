import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('prazos_pagamento')
export class PrazoPagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  nome: string;

  @Column({ length: 500, nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: ['dias', 'parcelas', 'personalizado'],
    default: 'dias'
  })
  tipo: 'dias' | 'parcelas' | 'personalizado';

  @Column({ type: 'jsonb' })
  configuracoes: {
    // Para tipo 'dias'
    dias?: number;
    percentualEntrada?: number;
    percentualRestante?: number;
    
    // Para tipo 'parcelas'
    numeroParcelas?: number;
    intervaloDias?: number;
    percentualParcelas?: number;
    
    // Para tipo 'personalizado'
    parcelas?: Array<{
      numero: number;
      dias: number;
      percentual: number;
      descricao?: string;
    }>;
  };

  @Column({ default: true })
  ativo: boolean;

  @Column({ default: false })
  padrao: boolean;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
