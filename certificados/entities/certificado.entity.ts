import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('certificados')
export class Certificado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 18 })
  cnpj: string;

  @Column({ type: 'date' })
  validade: Date;

  @Column({ type: 'enum', enum: ['A1', 'A3'] })
  tipo: 'A1' | 'A3';

  @Column({ type: 'enum', enum: ['ativo', 'expirado', 'inativo'], default: 'ativo' })
  status: 'ativo' | 'expirado' | 'inativo';

  @Column({ type: 'varchar', length: 255 })
  nomeArquivo: string;

  @Column({ type: 'varchar', length: 500 })
  caminhoArquivo: string;

  @Column({ type: 'varchar', length: 64 })
  hashArquivo: string;

  @Column({ type: 'varchar', length: 500 })
  senhaCriptografada: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  ultimaVerificacao: Date;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos auxiliares
  isExpired(): boolean {
    const validadeDate = typeof this.validade === 'string' 
      ? new Date(this.validade) 
      : this.validade;
    return new Date() > validadeDate;
  }

  getDaysUntilExpiration(): number {
    const now = new Date();
    const validadeDate = typeof this.validade === 'string' 
      ? new Date(this.validade) 
      : this.validade;
    const diffTime = validadeDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  updateStatus(): void {
    if (this.isExpired()) {
      this.status = 'expirado';
    } else {
      this.status = 'ativo';
    }
  }
}
