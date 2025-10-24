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
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProdutoDto: CreateProdutoDto, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return await this.produtosService.create(createProdutoDto, companyId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    const companyId = req.user.activeCompanyId;
    return await this.produtosService.findAll(companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return await this.produtosService.findOne(id, companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateProdutoDto: Partial<CreateProdutoDto>, @Request() req) {
    const companyId = req.user.activeCompanyId;
    return await this.produtosService.update(id, updateProdutoDto, companyId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    const companyId = req.user.activeCompanyId;
    await this.produtosService.remove(id, companyId);
    return { message: 'Produto removido com sucesso' };
  }
}



