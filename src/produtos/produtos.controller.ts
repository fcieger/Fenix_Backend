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
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  async create(@Body() createProdutoDto: CreateProdutoDto, @Request() req) {
    // Adicionar companyId do usuário autenticado (primeira empresa)
    if (!req.user.companies || req.user.companies.length === 0) {
      throw new Error('Usuário não possui empresas associadas');
    }

    const companyId = req.user.companies[0].id;
    return await this.produtosService.create(createProdutoDto, companyId);
  }

  @Get()
  async findAll(@Request() req) {
    // Temporariamente sem autenticação para teste
    if (req.user && req.user.companies && req.user.companies.length > 0) {
      return await this.produtosService.findAll(req.user.companies[0].id);
    } else {
      // Retornar produtos de uma empresa específica para teste
      return await this.produtosService.findAll(
        '2c650c76-4e2a-4b58-933c-c3f8b7434d80',
      ); // Hardcoded companyId for testing
    }
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.produtosService.findOne(id, req.user.companies[0].id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProdutoDto: Partial<CreateProdutoDto>,
    @Request() req,
  ) {
    return await this.produtosService.update(
      id,
      updateProdutoDto,
      req.user.companies[0].id,
    );
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    await this.produtosService.remove(id, req.user.companies[0].id);
    return { message: 'Produto removido com sucesso' };
  }
}
