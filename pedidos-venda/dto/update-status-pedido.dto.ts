import { IsEnum, IsString, IsOptional } from 'class-validator';
import { StatusPedido } from '../../shared/enums/pedido-venda.enums';

export class UpdateStatusPedidoDto {
  @IsEnum(StatusPedido)
  status: StatusPedido;

  @IsString()
  @IsOptional()
  observacao?: string;
}
