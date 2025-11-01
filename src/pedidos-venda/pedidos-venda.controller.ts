import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { PedidosVendaService } from './pedidos-venda.service';
import { CreatePedidoVendaDto } from './dto/create-pedido-venda.dto';
import { UpdatePedidoVendaDto } from './dto/update-pedido-venda.dto';
import { CreatePedidoVendaFromOrcamentoDto } from './dto/create-from-orcamento.dto';

@Controller('pedidos-venda')
export class PedidosVendaController {
  constructor(private readonly service: PedidosVendaService) {}

  @Post()
  create(@Body() dto: CreatePedidoVendaDto) { return this.service.create(dto); }

  @Post('from-orcamento/:orcamentoId')
  async createFromOrcamento(
    @Param('orcamentoId') orcamentoId: string, 
    @Body() dto?: CreatePedidoVendaFromOrcamentoDto
  ) {
    const dtoCompleto: CreatePedidoVendaFromOrcamentoDto = {
      orcamentoId,
      ...dto,
    };
    return this.service.createFromOrcamento(dtoCompleto);
  }

  @Get()
  async findAll(@Query() q: any) { 
    const result = await this.service.findAll(q);
    console.log(`[Controller] Retornando ${result.length} pedidos de venda`);
    if (result.length > 0) {
      console.log(`[Controller] Primeiro tem itens? ${!!result[0].itens}, quantidade: ${result[0].itens?.length || 0}`);
      console.log(`[Controller] Primeiro tem chave itens? ${Object.prototype.hasOwnProperty.call(result[0], 'itens')}`);
      console.log(`[Controller] Chaves do primeiro: ${Object.keys(result[0]).join(', ')}`);
      // Garantir que itens está presente antes de retornar
      if (!result[0].itens) {
        console.log(`[Controller] ERRO: Primeiro pedido de venda não tem campo itens!`);
      } else {
        console.log(`[Controller] SUCESSO: Primeiro pedido de venda TEM campo itens com ${result[0].itens.length} itens!`);
      }
    }
    // Retornar diretamente sem serialização adicional
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) { 
    return this.service.findOne(id); 
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePedidoVendaDto) { 
    return this.service.update(id, dto); 
  }

  @Post(':id/recalcular-impostos')
  recalc(@Param('id') id: string) { 
    return this.service.recalcularImpostos(id); 
  }

  @Delete(':id')
  remove(@Param('id') id: string) { 
    return this.service.remove(id); 
  }
}
