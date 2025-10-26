import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContatoDto } from './contato.dto';

export class EnderecoDto {
  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  logradouro?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsString()
  bairro?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}

export class TiposClienteDto {
  @IsBoolean()
  cliente: boolean;

  @IsBoolean()
  vendedor: boolean;

  @IsBoolean()
  fornecedor: boolean;

  @IsBoolean()
  funcionario: boolean;

  @IsBoolean()
  transportadora: boolean;

  @IsBoolean()
  prestadorServico: boolean;
}

export class CreateCadastroDto {
  @IsString()
  nomeRazaoSocial: string;

  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @IsEnum(['Pessoa Física', 'Pessoa Jurídica'])
  tipoPessoa: 'Pessoa Física' | 'Pessoa Jurídica';

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsObject()
  tiposCliente?: TiposClienteDto;

  // Informações de Contato (mantido para compatibilidade)
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  pessoaContato?: string;

  @IsOptional()
  @IsString()
  telefoneComercial?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  celularContato?: string;

  // Contatos múltiplos
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContatoDto)
  contatos?: ContatoDto[];

  // Informações Tributárias
  @IsOptional()
  @IsBoolean()
  optanteSimples?: boolean;

  @IsOptional()
  @IsBoolean()
  orgaoPublico?: boolean;

  @IsOptional()
  @IsString()
  ie?: string;

  @IsOptional()
  @IsString()
  im?: string;

  @IsOptional()
  @IsString()
  suframa?: string;

  // Endereços
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnderecoDto)
  enderecos?: EnderecoDto[];

  // Observações
  @IsOptional()
  @IsString()
  observacoes?: string;

  // IDs de relacionamento
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
