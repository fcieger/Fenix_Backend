import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class ContatoDto {
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

  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}
