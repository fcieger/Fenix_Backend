import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Company } from './entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, owner?: any): Promise<Company> {
    // Verificar se CNPJ já existe
    const existingCompany = await this.companiesRepository.findOne({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('CNPJ já está em uso');
    }

    // Gerar token único para a empresa
    const token = this.generateUniqueToken();

    // Criar empresa
    const company = this.companiesRepository.create({
      ...createCompanyDto,
      token,
      users: owner ? [owner] : [],
    });

    return this.companiesRepository.save(company);
  }

  async findByToken(token: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { token },
      relations: ['users'],
    });
  }

  async findById(id: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { id },
      relations: ['users'],
    });
  }

  async findByUserId(userId: string): Promise<Company[]> {
    return this.companiesRepository
      .createQueryBuilder('company')
      .leftJoin('company.users', 'user')
      .where('user.id = :userId', { userId })
      .getMany();
  }

  async update(id: string, updateData: Partial<CreateCompanyDto>): Promise<Company | null> {
    const company = await this.findById(id);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar se CNPJ já existe em outra empresa
    if (updateData.cnpj && updateData.cnpj !== company.cnpj) {
      const existingCompany = await this.companiesRepository.findOne({
        where: { cnpj: updateData.cnpj },
      });

      if (existingCompany) {
        throw new ConflictException('CNPJ já está em uso por outra empresa');
      }
    }

    await this.companiesRepository.update(id, updateData);
    return this.findById(id);
  }

  private generateUniqueToken(): string {
    return randomBytes(32).toString('hex');
  }
}
