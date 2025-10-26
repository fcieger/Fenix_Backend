import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NaturezaOperacao } from './natureza-operacao.entity';

@Entity('configuracao_imposto_estado')
export class ConfiguracaoImpostoEstado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  naturezaOperacaoId: string;

  @Column({ length: 2 })
  uf: string;

  @Column({ default: false })
  habilitado: boolean;

  // Campos específicos do estado
  @Column({ length: 10, nullable: true })
  cfop: string;

  @Column({ length: 255, nullable: true })
  naturezaOperacaoDescricao: string;

  @Column({
    type: 'enum',
    enum: ['interna', 'interestadual', 'exterior'],
    default: 'interna',
    nullable: true,
  })
  localDestinoOperacao: 'interna' | 'interestadual' | 'exterior';

  // ICMS
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsAliquota: number;

  @Column({ length: 3, nullable: true })
  icmsCST: string;

  @Column({ length: 2, nullable: true })
  icmsOrigem: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsBaseCalculo: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsReducaoBase: number;

  @Column({ length: 2, nullable: true })
  icmsModalidade: string;

  // ICMS - Campos de configuração (checkboxes)
  @Column({ default: false })
  icmsSimples: boolean;

  @Column({ default: false })
  icmsReduzirBase: boolean;

  @Column({ default: false })
  icmsIncluirFrete: boolean;

  @Column({ default: false })
  icmsCredita: boolean;

  @Column({ default: false })
  icmsIncluirDesconto: boolean;

  @Column({ default: false })
  icmsIncluirSeguro: boolean;

  @Column({ default: false })
  icmsIncluirOutrasDespesas: boolean;

  @Column({ default: false })
  icmsImportacao: boolean;

  @Column({ default: false })
  icmsDebita: boolean;

  @Column({ default: false })
  icmsIncluirIpi: boolean;

  @Column({ default: false })
  icmsReduzirValor: boolean;

  @Column({ default: false })
  icmsIncluirDespesas: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsAliquotaDeferimento: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsFcp: number;

  @Column({ length: 255, nullable: true })
  icmsMotivoDesoneracao: string;

  // ICMS ST
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsStAliquota: number;

  @Column({ length: 3, nullable: true })
  icmsStCST: string;

  @Column({ length: 2, nullable: true })
  icmsStOrigem: string;

  @Column({ length: 2, nullable: true })
  icmsStModalidade: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsStMva: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsStReducaoBase: number;

  // ICMS ST - Campos de configuração (checkboxes)
  @Column({ default: false })
  icmsStSimples: boolean;

  @Column({ default: false })
  icmsStReduzirBase: boolean;

  @Column({ default: false })
  icmsStIncluirFrete: boolean;

  @Column({ default: false })
  icmsStIncluirSeguro: boolean;

  @Column({ default: false })
  icmsStIncluirOutrasDespesas: boolean;

  @Column({ default: false })
  icmsStReduzirValor: boolean;

  @Column({ default: false })
  icmsStIncluirDespesas: boolean;

  @Column({ default: false })
  icmsStCredita: boolean;

  @Column({ default: false })
  icmsStIncluirDesconto: boolean;

  @Column({ default: false })
  icmsStImportacao: boolean;

  @Column({ default: false })
  icmsStDebita: boolean;

  @Column({ default: false })
  icmsStIncluirIpi: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsStFecop: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsStPmpf: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsStFcp: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsStInterno: number;

  @Column({ default: false })
  icmsStDestacar: boolean;

  @Column({ default: false })
  icmsStPmpfConsumidorFinal: boolean;

  @Column({ default: false })
  icmsStDifal: boolean;

  // ICMS Consumidor Final
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsConsumidorFinalAliquota: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsConsumidorFinalDifal: number;

  // ICMS Consumidor Final - Campos de configuração (checkboxes)
  @Column({ default: false })
  icmsConsumidorFinalIncluirInterno: boolean;

  @Column({ default: false })
  icmsConsumidorFinalNaoDevido: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsConsumidorFinalInterno: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsConsumidorFinalOperacao: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsConsumidorFinalProvisorioOrigem: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsConsumidorFinalProvisorioDestino: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  icmsConsumidorFinalFcp: number;

  // PIS
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  pisAliquota: number;

  @Column({ length: 3, nullable: true })
  pisCST: string;

  // PIS - Campos de configuração (checkboxes)
  @Column({ default: false })
  pisSimples: boolean;

  @Column({ default: false })
  pisReduzirBase: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  pisReducaoBase: number;

  @Column({ default: false })
  pisCredita: boolean;

  @Column({ default: false })
  pisDebita: boolean;

  @Column({ default: false })
  pisIncluirDespesas: boolean;

  @Column({ default: false })
  pisAplicarProduto: boolean;

  @Column({ default: false })
  pisImportacao: boolean;

  @Column({ default: false })
  pisIncluirFrete: boolean;

  @Column({ default: false })
  pisIncluirDesconto: boolean;

  // COFINS
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cofinsAliquota: number;

  @Column({ length: 3, nullable: true })
  cofinsCST: string;

  // COFINS - Campos de configuração (checkboxes)
  @Column({ default: false })
  cofinsSimples: boolean;

  @Column({ default: false })
  cofinsReduzirBase: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cofinsReducaoBase: number;

  @Column({ default: false })
  cofinsCredita: boolean;

  @Column({ default: false })
  cofinsDebita: boolean;

  @Column({ default: false })
  cofinsIncluirDespesas: boolean;

  @Column({ default: false })
  cofinsAplicarProduto: boolean;

  @Column({ default: false })
  cofinsImportacao: boolean;

  @Column({ default: false })
  cofinsIncluirFrete: boolean;

  @Column({ default: false })
  cofinsIncluirDesconto: boolean;

  // IPI
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  ipiAliquota: number;

  @Column({ length: 3, nullable: true })
  ipiCST: string;

  @Column({ length: 10, nullable: true })
  ipiClasse: string;

  @Column({ length: 10, nullable: true })
  ipiCodigo: string;

  @Column({ default: false })
  ipiSimples: boolean;

  @Column({ default: false })
  ipiReduzirBase: boolean;

  @Column({ default: false })
  ipiIncluirFrete: boolean;

  @Column({ default: false })
  ipiIncluirDesconto: boolean;

  @Column({ default: false })
  ipiIncluirDespesas: boolean;

  @Column({ default: false })
  ipiCredita: boolean;

  @Column({ default: false })
  ipiDebita: boolean;

  @Column({ default: false })
  ipiImportacao: boolean;

  // ISS
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  issAliquota: number;

  @Column({ default: false })
  issRetencao: boolean;

  @Column({ length: 3, nullable: true })
  issCST: string;

  @Column({ length: 255, nullable: true })
  issSituacao: string;

  @Column({ length: 255, nullable: true })
  issNaturezaOperacao: string;

  // ISS - Impostos Retidos
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  issPorcentagem: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  issAcimaDe: number;

  @Column({ default: false })
  issRetido: boolean;

  // CSLL - Impostos Retidos
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  csllPorcentagem: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  csllAcimaDe: number;

  @Column({ default: false })
  csllRetido: boolean;

  // PIS - Impostos Retidos
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  pisPorcentagem: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  pisAcimaDe: number;

  @Column({ default: false })
  pisRetido: boolean;

  // INSS - Impostos Retidos
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  inssPorcentagem: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  inssAcimaDe: number;

  @Column({ default: false })
  inssRetido: boolean;

  // IR - Impostos Retidos
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  irPorcentagem: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  irAcimaDe: number;

  @Column({ default: false })
  irRetido: boolean;

  // COFINS - Impostos Retidos
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cofinsPorcentagem: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cofinsAcimaDe: number;

  @Column({ default: false })
  cofinsRetido: boolean;

  // Outros Impostos (sistema flexível)
  @Column('json', { nullable: true })
  outrosImpostos: Array<{
    nome: string;
    aliquota: number;
    observacoes?: string;
  }>;

  // Informações Adicionais
  @Column('text', { nullable: true })
  informacoesInteresseFisco: string;

  @Column('text', { nullable: true })
  informacoesInteresseContribuinte: string;

  @ManyToOne(() => NaturezaOperacao, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'naturezaOperacaoId' })
  naturezaOperacao: NaturezaOperacao;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
