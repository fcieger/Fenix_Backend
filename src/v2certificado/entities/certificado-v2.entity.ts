import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

export enum CertificadoTipo {
  A1 = 'A1',
  A3 = 'A3'
}

export enum CertificadoStatus {
  PENDENTE = 'pendente',
  ATIVO = 'ativo',
  EXPIRADO = 'expirado',
  INATIVO = 'inativo',
  ERRO_VALIDACAO = 'erro_validacao'
}

@Entity('certificados_v2')
export class CertificadoV2 {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome_razao_social' })
  nomeRazaoSocial: string;

  @Column()
  cnpj: string;

  @Column({ type: 'timestamp' })
  validade: Date;

  @Column({ type: 'enum', enum: CertificadoTipo })
  tipo: CertificadoTipo;

  @Column({ type: 'enum', enum: CertificadoStatus, default: CertificadoStatus.PENDENTE })
  status: CertificadoStatus;

  @Column({ name: 'arquivo_original', type: 'bytea' })
  arquivoOriginal: Buffer;

  @Column({ name: 'arquivo_criptografado', type: 'bytea' })
  arquivoCriptografado: Buffer;

  @Column({ name: 'hash_arquivo' })
  hashArquivo: string;

  @Column({ name: 'nome_arquivo' })
  nomeArquivo: string;

  @Column({ name: 'tamanho_arquivo' })
  tamanhoArquivo: number;

  @Column({ name: 'data_upload', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dataUpload: Date;

  @Column({ name: 'ultima_verificacao', type: 'timestamp', nullable: true })
  ultimaVerificacao: Date;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'criado_por' })
  criadoPor: string;

  @Column({ name: 'observacoes', nullable: true })
  observacoes: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'criado_por' })
  criador: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
