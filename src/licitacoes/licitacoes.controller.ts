import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LicitacoesService } from './licitacoes.service';
import { SearchLicitacaoDto } from './dto/search-licitacao.dto';
import { CreateAlertaDto } from './dto/create-alerta.dto';
import { UpdateAlertaDto } from './dto/update-alerta.dto';

@Controller('api/licitacoes')
export class LicitacoesController {
  constructor(private readonly licitacoesService: LicitacoesService) {}

  @Get()
  async listar(@Query() filtros: SearchLicitacaoDto) {
    return this.licitacoesService.listar(filtros);
  }

  @Post('buscar')
  async buscar(@Body() dto: SearchLicitacaoDto) {
    return this.licitacoesService.listar(dto);
  }

  @Get('estatisticas')
  async estatisticas() {
    return this.licitacoesService.estatisticas();
  }

  @Get('matches')
  async matches(@Query('companyId') companyId: string) {
    return this.licitacoesService.buscarMatches(companyId);
  }

  @Post('sincronizar')
  async sincronizar(
    @Body('fonte') fonte: 'pncp' | 'compras-gov' | 'todas' = 'todas',
  ) {
    return this.licitacoesService.sincronizar(fonte);
  }

  @Get('alertas')
  async listarAlertas(@Query('userId') userId: string) {
    return this.licitacoesService.listarAlertas(userId);
  }

  @Post('alertas')
  async criarAlerta(
    @Body() dto: CreateAlertaDto,
    @Query('userId') userId: string,
  ) {
    return this.licitacoesService.criarAlerta(userId, dto);
  }

  @Put('alertas/:id')
  async atualizarAlerta(
    @Param('id') id: string,
    @Body() dto: UpdateAlertaDto,
  ) {
    return this.licitacoesService.atualizarAlerta(id, dto);
  }

  @Delete('alertas/:id')
  async deletarAlerta(@Param('id') id: string) {
    return this.licitacoesService.deletarAlerta(id);
  }

  @Get(':id')
  async detalhes(@Param('id') id: string) {
    return this.licitacoesService.buscarPorId(id);
  }
}



