import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-companies')
  getMyCompanies(@Request() req) {
    return req.user.companies;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getCompany(@Param('id') id: string, @Request() req) {
    // Verificar se o usuário tem acesso à empresa
    const userCompanies = req.user.companies || [];
    const hasAccess = userCompanies.some(company => company.id === id);
    
    if (!hasAccess) {
      throw new Error('Acesso negado a esta empresa');
    }

    return await this.companiesService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req
  ) {
    // Verificar se o usuário tem acesso à empresa
    const userCompanies = req.user.companies || [];
    const hasAccess = userCompanies.some(company => company.id === id);
    
    if (!hasAccess) {
      throw new Error('Acesso negado a esta empresa');
    }

    return await this.companiesService.update(id, updateCompanyDto);
  }
}
