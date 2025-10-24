import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cadastro } from './entities/cadastro.entity';
import { CreateCadastroDto } from './dto/create-cadastro.dto';

@Injectable()
export class CadastrosService {
  constructor(
    @InjectRepository(Cadastro)
    private cadastrosRepository: Repository<Cadastro>,
  ) {}

  async create(createCadastroDto: CreateCadastroDto, companyId: string): Promise<Cadastro> {
    const cadastro = this.cadastrosRepository.create({
      ...createCadastroDto,
      companyId
    });
    return await this.cadastrosRepository.save(cadastro);
  }

  async findAll(companyId: string): Promise<Cadastro[]> {
    return await this.cadastrosRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Cadastro> {
    const cadastro = await this.cadastrosRepository.findOne({
      where: { id, companyId },
    });

    if (!cadastro) {
      throw new NotFoundException('Cadastro não encontrado');
    }

    return cadastro;
  }

  async update(id: string, updateData: Partial<CreateCadastroDto>, companyId: string): Promise<Cadastro> {
    const cadastro = await this.findOne(id, companyId);
    
    Object.assign(cadastro, updateData);
    return await this.cadastrosRepository.save(cadastro);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const cadastro = await this.findOne(id, companyId);
    await this.cadastrosRepository.remove(cadastro);
  }
}
