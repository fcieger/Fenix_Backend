import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { ConfiguracaoImpostoEstado } from './configuracao-imposto-estado.entity';

@Entity('natureza_operacao')
export class NaturezaOperacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ length: 4 })
  cfop: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'vendas',
  })
  tipo: string;

  @Column({ default: false })
  movimentaEstoque: boolean;

  @Column({ default: true })
  habilitado: boolean;

  @Column({ default: false })
  considerarOperacaoComoFaturamento: boolean;

  @Column({ default: false })
  destacarTotalImpostosIBPT: boolean;

  @Column({ default: false })
  gerarContasReceberPagar: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  tipoDataContasReceberPagar: string | null;

  @Column({ type: 'text', nullable: true })
  informacoesAdicionaisFisco: string;

  @Column({ type: 'text', nullable: true })
  informacoesAdicionaisContribuinte: string;

  @Column('uuid')
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
