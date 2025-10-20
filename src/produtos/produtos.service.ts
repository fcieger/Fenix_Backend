import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private produtosRepository: Repository<Produto>,
  ) {}

  async create(createProdutoDto: CreateProdutoDto, companyId: string): Promise<Produto> {
    const produto = this.produtosRepository.create({
      ...createProdutoDto,
      companyId
    });
    return await this.produtosRepository.save(produto);
  }

  async findAll(companyId: string): Promise<Produto[]> {
    return await this.produtosRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, companyId: string): Promise<Produto | null> {
    return await this.produtosRepository.findOne({
      where: { id, companyId }
    });
  }

  async update(id: string, updateProdutoDto: Partial<CreateProdutoDto>, companyId: string): Promise<Produto | null> {
    await this.produtosRepository.update({ id, companyId }, updateProdutoDto);
    return await this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.produtosRepository.delete({ id, companyId });
  }
}
