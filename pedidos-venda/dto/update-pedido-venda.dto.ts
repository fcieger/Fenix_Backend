import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoVendaDto } from './create-pedido-venda.dto';

export class UpdatePedidoVendaDto extends PartialType(CreatePedidoVendaDto) {}
