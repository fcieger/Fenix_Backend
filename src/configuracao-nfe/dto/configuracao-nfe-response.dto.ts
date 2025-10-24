import { Exclude, Expose } from 'class-transformer';
import { TipoModeloNfe, AmbienteNfe } from '../../shared/enums/configuracao-nfe.enums';

export class ConfiguracaoNfeResponseDto {
  @Expose()
  id: string;

  @Expose()
  companyId: string;

  @Expose()
  descricaoModelo: string;

  @Expose()
  tipoModelo: TipoModeloNfe;

  @Expose()
  modelo: string;

  @Expose()
  serie: string;

  @Expose()
  numeroAtual: number;

  @Expose()
  ambiente: AmbienteNfe;

  @Expose()
  ativo: boolean;

  // Campos RPS
  @Expose()
  rpsNaturezaOperacao: string;

  @Expose()
  rpsRegimeTributario: string;

  @Expose()
  rpsRegimeEspecialTributacao: string;

  @Expose()
  rpsNumeroLoteAtual: number;

  @Expose()
  rpsSerieLoteAtual: number;

  @Expose()
  rpsLoginPrefeitura: string;

  // Senha não é exposta
  @Exclude()
  rpsSenhaPrefeitura: string;

  @Expose()
  rpsAliquotaISS: number;

  @Expose()
  rpsEnviarNotificacaoCliente: boolean;

  @Expose()
  rpsReceberNotificacao: boolean;

  @Expose()
  rpsEmailNotificacao: string;

  // Campos NFC-e
  @Expose()
  nfceIdToken: string;

  // CSC Token não é exposto
  @Exclude()
  nfceCscToken: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
















