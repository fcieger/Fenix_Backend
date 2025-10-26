import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import {
  TipoModeloNfe,
  AmbienteNfe,
} from '../../shared/enums/configuracao-nfe.enums';

@Entity('configuracao_nfe')
@Index(['companyId', 'modelo', 'serie'], { unique: true })
@Index(['companyId', 'ativo'])
export class ConfiguracaoNfe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relacionamento com empresa
  @ManyToOne(() => Company, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  // Campos Básicos - Configuração do Modelo
  @Column({ name: 'descricao_modelo' })
  descricaoModelo: string;

  @Column({
    name: 'tipo_modelo',
    type: 'enum',
    enum: TipoModeloNfe,
  })
  tipoModelo: TipoModeloNfe;

  @Column()
  modelo: string;

  @Column()
  serie: string;

  @Column({ name: 'numero_atual', type: 'integer', default: 0 })
  numeroAtual: number;

  @Column({
    type: 'enum',
    enum: AmbienteNfe,
    default: AmbienteNfe.PRODUCAO,
  })
  ambiente: AmbienteNfe;

  @Column({ default: true })
  ativo: boolean;

  // Campos RPS (NFS-e)
  @Column({ name: 'rps_natureza_operacao', nullable: true })
  rpsNaturezaOperacao: string;

  @Column({ name: 'rps_regime_tributario', nullable: true })
  rpsRegimeTributario: string;

  @Column({ name: 'rps_regime_especial_tributacao', nullable: true })
  rpsRegimeEspecialTributacao: string;

  @Column({ name: 'rps_numero_lote_atual', type: 'integer', default: 0 })
  rpsNumeroLoteAtual: number;

  @Column({ name: 'rps_serie_lote_atual', type: 'integer', default: 0 })
  rpsSerieLoteAtual: number;

  @Column({ name: 'rps_login_prefeitura', nullable: true })
  rpsLoginPrefeitura: string;

  @Column({ name: 'rps_senha_prefeitura', nullable: true })
  rpsSenhaPrefeitura: string; // Armazenado criptografado

  @Column({
    name: 'rps_aliquota_iss',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  rpsAliquotaISS: number;

  @Column({ name: 'rps_enviar_notificacao_cliente', default: false })
  rpsEnviarNotificacaoCliente: boolean;

  @Column({ name: 'rps_receber_notificacao', default: false })
  rpsReceberNotificacao: boolean;

  @Column({ name: 'rps_email_notificacao', nullable: true })
  rpsEmailNotificacao: string;

  // Campos NFC-e
  @Column({ name: 'nfce_id_token', nullable: true })
  nfceIdToken: string;

  @Column({ name: 'nfce_csc_token', nullable: true })
  nfceCscToken: string; // Armazenado criptografado

  // Metadados
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
