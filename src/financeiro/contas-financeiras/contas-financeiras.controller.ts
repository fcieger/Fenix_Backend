import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContasFinanceirasService } from './contas-financeiras.service';
import { CreateContaFinanceiraDto } from './dto/create-conta-financeira.dto';
import { UpdateContaFinanceiraDto } from './dto/update-conta-financeira.dto';

@Controller('contas')
export class ContasFinanceirasController {
  constructor(private readonly contasFinanceirasService: ContasFinanceirasService) {}

  @Post()
  create(@Body() createContaFinanceiraDto: CreateContaFinanceiraDto) {
    return this.contasFinanceirasService.create(createContaFinanceiraDto);
  }

  @Get()
  findAll(@Query('company_id') companyId?: string, @Query('status') status?: string) {
    return this.contasFinanceirasService.findAll(companyId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contasFinanceirasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContaFinanceiraDto: UpdateContaFinanceiraDto) {
    return this.contasFinanceirasService.update(id, updateContaFinanceiraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contasFinanceirasService.remove(id);
  }
}

