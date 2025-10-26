import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('cadastros')
export class Cadastro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nomeRazaoSocial: string;

  @Column({ nullable: true })
  nomeFantasia: string;

  @Column()
  tipoPessoa: 'Pessoa Física' | 'Pessoa Jurídica';

  @Column({ nullable: true })
  cpf: string;

  @Column({ nullable: true })
  cnpj: string;

  @Column('json', { nullable: true })
  tiposCliente: {
    cliente: boolean;
    vendedor: boolean;
    fornecedor: boolean;
    funcionario: boolean;
    transportadora: boolean;
    prestadorServico: boolean;
  };

  // Informações de Contato
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  pessoaContato: string;

  @Column({ nullable: true })
  telefoneComercial: string;

  @Column({ nullable: true })
  celular: string;

  @Column({ nullable: true })
  cargo: string;

  @Column({ nullable: true })
  celularContato: string;

  // Informações Tributárias
  @Column({ default: false })
  optanteSimples: boolean;

  @Column({ default: false })
  orgaoPublico: boolean;

  @Column({ nullable: true })
  ie: string;

  @Column({ nullable: true })
  im: string;

  @Column({ nullable: true })
  suframa: string;

  // Contatos múltiplos (JSON array)
  @Column('json', { nullable: true })
  contatos: Array<{
    email?: string;
    pessoaContato?: string;
    telefoneComercial?: string;
    celular?: string;
    cargo?: string;
    celularContato?: string;
    principal?: boolean;
  }>;

  // Endereços (JSON array)
  @Column('json', { nullable: true })
  enderecos: Array<{
    tipo: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    principal: boolean;
  }>;

  // Observações
  @Column('text', { nullable: true })
  observacoes: string;

  // Relacionamento com empresa
  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
