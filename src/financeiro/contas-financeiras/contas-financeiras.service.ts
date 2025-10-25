import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContaFinanceira } from './entities/conta-financeira.entity';
import { CreateContaFinanceiraDto } from './dto/create-conta-financeira.dto';
import { UpdateContaFinanceiraDto } from './dto/update-conta-financeira.dto';

@Injectable()
export class ContasFinanceirasService {
  constructor(
    @InjectRepository(ContaFinanceira)
    private contasFinanceirasRepository: Repository<ContaFinanceira>,
  ) {}

  async create(createContaFinanceiraDto: CreateContaFinanceiraDto): Promise<ContaFinanceira> {
    const conta = this.contasFinanceirasRepository.create(createContaFinanceiraDto);
    return this.contasFinanceirasRepository.save(conta);
  }

  async findAll(companyId?: string, status?: string): Promise<ContaFinanceira[]> {
    const query = this.contasFinanceirasRepository.createQueryBuilder('conta');
    
    if (companyId) {
      query.andWhere('conta.companyId = :companyId', { companyId });
    }
    
    if (status) {
      query.andWhere('conta.status = :status', { status });
    }
    
    return query.getMany();
  }

  async findOne(id: string): Promise<ContaFinanceira | null> {
    return this.contasFinanceirasRepository.findOne({ where: { id } });
  }

  async update(id: string, updateContaFinanceiraDto: UpdateContaFinanceiraDto): Promise<ContaFinanceira | null> {
    await this.contasFinanceirasRepository.update(id, updateContaFinanceiraDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.contasFinanceirasRepository.delete(id);
  }
}
