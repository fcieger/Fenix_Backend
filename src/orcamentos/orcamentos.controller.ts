import { Controller, Get, Post, Body, Param, Delete, Put, Patch, Query } from '@nestjs/common';
import { OrcamentosService } from './orcamentos.service';
import { CreateOrcamentoDto } from './dto/create-orcamento.dto';
import { UpdateOrcamentoDto } from './dto/update-orcamento.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Controller('orcamentos')
export class OrcamentosController {
  constructor(private readonly service: OrcamentosService) {}

  @Post()
  create(@Body() dto: CreateOrcamentoDto) { return this.service.create(dto); }

  @Get('test')
  async test() {
    const orc = await this.service.findAll({});
    return {
      total: orc.length,
      primeiroTemItens: !!orc[0]?.itens,
      quantidadeItens: orc[0]?.itens?.length || 0,
      primeiroOrcamento: orc[0] ? {
        id: orc[0].id,
        numero: orc[0].numero,
        temItens: !!orc[0].itens,
        quantidadeItens: orc[0].itens?.length || 0,
        itens: orc[0].itens || []
      } : null
    };
  }

  @Get()
  async findAll(@Query() q: any) { 
    const result = await this.service.findAll(q);
    console.log(`[Controller] Retornando ${result.length} orçamentos`);
    if (result.length > 0) {
      console.log(`[Controller] Primeiro tem itens? ${!!result[0].itens}, quantidade: ${result[0].itens?.length || 0}`);
      console.log(`[Controller] Primeiro tem chave itens? ${Object.prototype.hasOwnProperty.call(result[0], 'itens')}`);
      console.log(`[Controller] Chaves do primeiro: ${Object.keys(result[0]).join(', ')}`);
      // Garantir que itens está presente antes de retornar
      if (!result[0].itens) {
        console.log(`[Controller] ERRO: Primeiro orçamento não tem campo itens!`);
      } else {
        console.log(`[Controller] SUCESSO: Primeiro orçamento TEM campo itens com ${result[0].itens.length} itens!`);
      }
    }
    // Retornar diretamente sem serialização adicional
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrcamentoDto) { return this.service.update(id, dto); }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) { return this.service.changeStatus(id, dto.status); }

  @Post(':id/recalcular-impostos')
  recalc(@Param('id') id: string) { return this.service.recalcularImpostos(id); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}


