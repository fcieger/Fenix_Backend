import { IsString, IsNotEmpty, Matches, IsOptional, IsObject, IsArray, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{3}\.\d{3}\.\d{3}-\d{2})$/, {
    message: 'CNPJ deve estar no formato 00.000.000/0000-00 ou CPF no formato 000.000.000-00',
  })
  cnpj: string;

  @IsString()
  @IsOptional()
  name?: string;

  // Dados adicionais da consulta CNPJ
  @IsOptional()
  @IsString()
  founded?: string;

  @IsOptional()
  @IsString()
  nature?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zip: string;
  };

  @IsOptional()
  @IsString()
  mainActivity?: string;

  @IsOptional()
  @IsArray()
  phones?: Array<{
    type: string;
    area: string;
    number: string;
  }>;

  @IsOptional()
  @IsArray()
  emails?: Array<{
    ownership: string;
    address: string;
  }>;

  @IsOptional()
  @IsArray()
  members?: Array<{
    name: string;
    role: string;
    type: string;
  }>;

  @IsOptional()
  @IsBoolean()
  simplesNacional?: boolean;
}
