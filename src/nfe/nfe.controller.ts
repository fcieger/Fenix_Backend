import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NfeService } from './nfe.service';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { UpdateNfeDto } from './dto/update-nfe.dto';
import { CalcularImpostosDto } from './dto/calcular-impostos.dto';
import { NfeResponseDto } from './dto/nfe-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('nfe')
@UseGuards(JwtAuthGuard)
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}

  /**
   * Criar nova NFe (rascunho)
   */
  @Post()
  async create(@Request() req, @Body() createNfeDto: CreateNfeDto): Promise<NfeResponseDto> {
    const companyId = req.user.activeCompanyId;
    return this.nfeService.create(companyId, createNfeDto);
  }

  /**
   * Endpoint de teste para debug
   */
  @Get('test')
  async test() {
    console.log('🧪 Test endpoint called');
    return { message: 'Test endpoint working', timestamp: new Date().toISOString() };
  }

  /**
   * Listar todas as NFes da empresa
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('numeroNfe') numeroNfe?: string,
    @Query('destinatario') destinatario?: string,
  ) {
    console.log('🚀 NFeController.findAll - INÍCIO - CONTROLLER CHAMADO');
    
    const companyId = req.user.activeCompanyId;
    console.log('🚀 NFeController.findAll - companyId:', companyId);
    
    const filters = {
      status,
      dataInicio,
      dataFim,
      numeroNfe,
      destinatario
    };
    
    console.log('🚀 NFeController.findAll - Filtros:', filters);
    
    const nfes = await this.nfeService.findAll(companyId, filters);
    
    console.log('🚀 NFeController.findAll - Retornando NFes:', nfes.length);
    return nfes;
  }

  /**
   * Buscar NFe específica
   */
  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NfeResponseDto> {
    const companyId = req.user.activeCompanyId;
    return this.nfeService.findOne(id, companyId);
  }

  /**
   * Atualizar NFe
   */
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNfeDto: UpdateNfeDto,
  ): Promise<NfeResponseDto> {
    const companyId = req.user.activeCompanyId;
    return this.nfeService.update(id, companyId, updateNfeDto);
  }

  /**
   * Deletar NFe
   */
  @Delete(':id')
  async remove(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    const companyId = req.user.activeCompanyId;
    await this.nfeService.remove(id, companyId);
    return { message: 'NFe deletada com sucesso.' };
  }

  /**
   * Calcular impostos sem salvar
   */
  @Post('calcular-impostos')
  async calcularImpostos(
    @Request() req,
    @Body() calcularImpostosDto: CalcularImpostosDto,
  ): Promise<any> {
    return this.nfeService.calcularImpostos(calcularImpostosDto);
  }

}
