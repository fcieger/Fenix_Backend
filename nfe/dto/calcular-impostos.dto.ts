import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { NfeItemDto } from './create-nfe.dto';

export class CalcularImpostosDto {
  @IsString()
  naturezaOperacaoId: string;

  @IsString()
  ufOrigem: string;

  @IsString()
  ufDestino: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NfeItemDto)
  itens: NfeItemDto[];

  @IsOptional()
  @IsString()
  destinatarioTipo?: string; // F=CPF, J=CNPJ
}
