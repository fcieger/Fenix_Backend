import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PedidosVendaService } from './pedidos-venda.service';
import { CreatePedidoVendaDto } from './dto/create-pedido-venda.dto';
import { UpdatePedidoVendaDto } from './dto/update-pedido-venda.dto';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pedidos-venda')
@UseGuards(JwtAuthGuard)
export class PedidosVendaController {
  constructor(private readonly pedidosVendaService: PedidosVendaService) {}

  @Post()
  create(@Body() createPedidoDto: CreatePedidoVendaDto, @Request() req) {
    return this.pedidosVendaService.create(createPedidoDto, req.user.activeCompanyId);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.pedidosVendaService.findAll(req.user.activeCompanyId, pageNumber, limitNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.pedidosVendaService.findOne(id, req.user.activeCompanyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePedidoDto: UpdatePedidoVendaDto,
    @Request() req,
  ) {
    return this.pedidosVendaService.update(id, updatePedidoDto, req.user.activeCompanyId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusPedidoDto,
    @Request() req,
  ) {
    return this.pedidosVendaService.updateStatus(id, updateStatusDto, req.user.activeCompanyId);
  }

  @Post(':id/clonar')
  clonar(@Param('id') id: string, @Request() req) {
    return this.pedidosVendaService.clonar(id, req.user.activeCompanyId);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string, @Request() req) {
    return this.pedidosVendaService.cancelar(id, req.user.activeCompanyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.pedidosVendaService.remove(id, req.user.activeCompanyId);
  }
}
