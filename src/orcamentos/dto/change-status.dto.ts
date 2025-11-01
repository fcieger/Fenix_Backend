import { IsEnum } from 'class-validator';
import { StatusOrcamento } from '../entities/orcamento.entity';

export class ChangeStatusDto {
  @IsEnum(StatusOrcamento)
  status: StatusOrcamento;
}



