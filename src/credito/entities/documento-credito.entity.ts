import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SolicitacaoCredito } from './solicitacao-credito.entity';
import { User } from '../../users/entities/user.entity';

@Entity('documentos_credito')
export class DocumentoCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'solicitacao_id', type: 'uuid' })
  solicitacaoId: string;

  // Tipo de Documento
  @Column({ name: 'tipo_documento', type: 'varchar', length: 100 })
  tipoDocumento: string;

  // Arquivo
  @Column({ name: 'nome_arquivo', type: 'varchar', length: 255 })
  nomeArquivo: string;

  @Column({ name: 'caminho_arquivo', type: 'text' })
  caminhoArquivo: string;

  @Column({ name: 'tamanho_bytes', type: 'bigint', nullable: true })
  tamanhoBytes: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'pendente' })
  status: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({ name: 'validado_por', type: 'uuid', nullable: true })
  validadoPor: string;

  @Column({ name: 'data_validacao', type: 'timestamp', nullable: true })
  dataValidacao: Date;

  // Relacionamentos
  @ManyToOne(() => SolicitacaoCredito, (solicitacao) => solicitacao.documentos)
  @JoinColumn({ name: 'solicitacao_id' })
  solicitacao: SolicitacaoCredito;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validado_por' })
  validador: User;

  // Auditoria
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Métodos auxiliares
  estaAprovado(): boolean {
    return this.status === 'aprovado';
  }

  estaReprovado(): boolean {
    return this.status === 'reprovado';
  }

  precisaSubstituir(): boolean {
    return this.status === 'substituir';
  }

  tamanhoFormatado(): string {
    const bytes = this.tamanhoBytes;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}




