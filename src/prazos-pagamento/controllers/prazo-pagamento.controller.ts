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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrazoPagamentoService } from '../services/prazo-pagamento.service';
import { CreatePrazoPagamentoDto } from '../dto/create-prazo-pagamento.dto';
import { UpdatePrazoPagamentoDto } from '../dto/update-prazo-pagamento.dto';
import { QueryPrazoPagamentoDto } from '../dto/query-prazo-pagamento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('prazos-pagamento')
@UseGuards(JwtAuthGuard)
export class PrazoPagamentoController {
  constructor(private readonly prazoPagamentoService: PrazoPagamentoService) {}

  @Post()
  create(@Body() createDto: CreatePrazoPagamentoDto, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return this.prazoPagamentoService.create(createDto, companyId);
  }

  @Get()
  findAll(@Query() query: QueryPrazoPagamentoDto, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return this.prazoPagamentoService.findAll(query, companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return this.prazoPagamentoService.findOne(id, companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePrazoPagamentoDto,
    @Request() req,
  ) {
    const companyId = req.user.activeCompanyId;
    return this.prazoPagamentoService.update(id, updateDto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return this.prazoPagamentoService.remove(id, companyId);
  }

  @Patch(':id/padrao')
  setDefault(@Param('id') id: string, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return this.prazoPagamentoService.setDefault(id, companyId);
  }
}
