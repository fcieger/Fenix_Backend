import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CadastrosService } from './cadastros.service';
import { CreateCadastroDto } from './dto/create-cadastro.dto';

@Controller('cadastros')
@UseGuards(JwtAuthGuard)
export class CadastrosController {
  constructor(private readonly cadastrosService: CadastrosService) {}

  @Post()
  async create(@Body() createCadastroDto: CreateCadastroDto, @Request() req) {
    try {
      // Debug: verificar estrutura do usuário
      console.log('=== BACKEND - CREATE CADASTRO ===');
      console.log('User from JWT:', JSON.stringify(req.user, null, 2));
      console.log('Dados recebidos do frontend:', JSON.stringify(createCadastroDto, null, 2));
      
      // Verificar se usuário possui empresas
      if (!req.user.companies || req.user.companies.length === 0) {
        console.error('❌ Usuário não possui empresas associadas');
        throw new Error('Usuário não possui empresas associadas');
      }
      
      // Usar companyId do frontend se existir, senão usar da primeira empresa do usuário
      const companyId = createCadastroDto.companyId || req.user.companies[0].id;
      console.log('CompanyId final:', companyId);
      
      // Remover companyId e userId do DTO antes de salvar (para evitar duplicação)
      const { companyId: _, userId: __, ...cadastroData } = createCadastroDto;
      console.log('Dados para salvar (sem IDs):', JSON.stringify(cadastroData, null, 2));
      
      const result = await this.cadastrosService.create(cadastroData, companyId);
      console.log('✅ Cadastro criado com sucesso:', result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Erro no controller:', error.message);
      throw error;
    }
  }

  @Get()
  async findAll(@Request() req) {
    return await this.cadastrosService.findAll(req.user.companies[0].id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.cadastrosService.findOne(id, req.user.companies[0].id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCadastroDto: Partial<CreateCadastroDto>, @Request() req) {
    return await this.cadastrosService.update(id, updateCadastroDto, req.user.companies[0].id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.cadastrosService.remove(id, req.user.companies[0].id);
    return { message: 'Cadastro removido com sucesso' };
  }
}
