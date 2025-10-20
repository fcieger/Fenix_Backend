import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { PrazoPagamento } from '../entities/prazo-pagamento.entity';
import { CreatePrazoPagamentoDto } from '../dto/create-prazo-pagamento.dto';
import { UpdatePrazoPagamentoDto } from '../dto/update-prazo-pagamento.dto';
import { QueryPrazoPagamentoDto } from '../dto/query-prazo-pagamento.dto';

@Injectable()
export class PrazoPagamentoService {
  constructor(
    @InjectRepository(PrazoPagamento)
    private prazoPagamentoRepository: Repository<PrazoPagamento>,
  ) {}

  async create(createDto: CreatePrazoPagamentoDto, companyId: string): Promise<PrazoPagamento> {
    // Validar configurações baseadas no tipo
    this.validateConfigurations(createDto.tipo, createDto.configuracoes);

    // Se for padrão, remover padrão de outros prazos da empresa
    if (createDto.padrao) {
      await this.removeDefaultFromOthers(companyId);
    }

    const prazo = this.prazoPagamentoRepository.create({
      ...createDto,
      companyId,
    });

    return await this.prazoPagamentoRepository.save(prazo);
  }

  async findAll(query: QueryPrazoPagamentoDto, companyId: string) {
    const { page = 1, limit = 10, search, tipo, ativo, padrao } = query;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (search) {
      where.nome = Like(`%${search}%`);
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    if (padrao !== undefined) {
      where.padrao = padrao;
    }

    const options: FindManyOptions<PrazoPagamento> = {
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    const [data, total] = await this.prazoPagamentoRepository.findAndCount(options);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, companyId: string): Promise<PrazoPagamento> {
    const prazo = await this.prazoPagamentoRepository.findOne({
      where: { id, companyId },
    });

    if (!prazo) {
      throw new NotFoundException('Prazo de pagamento não encontrado');
    }

    return prazo;
  }

  async update(id: string, updateDto: UpdatePrazoPagamentoDto, companyId: string): Promise<PrazoPagamento> {
    const prazo = await this.findOne(id, companyId);

    // Validar configurações se fornecidas
    if (updateDto.tipo && updateDto.configuracoes) {
      this.validateConfigurations(updateDto.tipo, updateDto.configuracoes);
    }

    // Se for padrão, remover padrão de outros prazos da empresa
    if (updateDto.padrao) {
      await this.removeDefaultFromOthers(companyId, id);
    }

    Object.assign(prazo, updateDto);
    return await this.prazoPagamentoRepository.save(prazo);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const prazo = await this.findOne(id, companyId);
    await this.prazoPagamentoRepository.remove(prazo);
  }

  async setDefault(id: string, companyId: string): Promise<PrazoPagamento> {
    const prazo = await this.findOne(id, companyId);
    
    // Remover padrão de outros prazos
    await this.removeDefaultFromOthers(companyId, id);
    
    // Definir este como padrão
    prazo.padrao = true;
    return await this.prazoPagamentoRepository.save(prazo);
  }

  private async removeDefaultFromOthers(companyId: string, excludeId?: string): Promise<void> {
    const where: any = { companyId, padrao: true };
    if (excludeId) {
      where.id = { $ne: excludeId };
    }

    await this.prazoPagamentoRepository
      .createQueryBuilder()
      .update(PrazoPagamento)
      .set({ padrao: false })
      .where('companyId = :companyId', { companyId })
      .andWhere('padrao = :padrao', { padrao: true })
      .andWhere(excludeId ? 'id != :excludeId' : '1=1', { excludeId })
      .execute();
  }

  private validateConfigurations(tipo: string, configuracoes: any): void {
    switch (tipo) {
      case 'dias':
        if (configuracoes.dias === undefined || configuracoes.dias === null || configuracoes.dias < 0) {
          throw new BadRequestException('Dias deve ser um número não negativo (0 para à vista)');
        }
        if (configuracoes.percentualEntrada && configuracoes.percentualRestante) {
          const total = (configuracoes.percentualEntrada || 0) + (configuracoes.percentualRestante || 0);
          if (Math.abs(total - 100) > 0.01) {
            throw new BadRequestException('A soma dos percentuais deve ser 100%');
          }
        }
        break;

      case 'parcelas':
        if (!configuracoes.numeroParcelas || configuracoes.numeroParcelas <= 0) {
          throw new BadRequestException('Número de parcelas deve ser positivo');
        }
        if (!configuracoes.intervaloDias || configuracoes.intervaloDias <= 0) {
          throw new BadRequestException('Intervalo de dias deve ser positivo');
        }
        if (configuracoes.percentualEntrada && configuracoes.percentualParcelas) {
          const total = (configuracoes.percentualEntrada || 0) + 
                       ((configuracoes.percentualParcelas || 0) * (configuracoes.numeroParcelas || 1));
          if (Math.abs(total - 100) > 0.01) {
            throw new BadRequestException('A soma dos percentuais deve ser 100%');
          }
        }
        break;

      case 'personalizado':
        if (!configuracoes.parcelas || !Array.isArray(configuracoes.parcelas) || configuracoes.parcelas.length === 0) {
          throw new BadRequestException('Deve ter pelo menos uma parcela para tipo personalizado');
        }
        
        let totalPercentual = 0;
        for (const parcela of configuracoes.parcelas) {
          if (!parcela.numero || parcela.numero <= 0) {
            throw new BadRequestException('Número da parcela deve ser positivo');
          }
          if (!parcela.dias || parcela.dias < 0) {
            throw new BadRequestException('Dias da parcela deve ser não negativo');
          }
          if (!parcela.percentual || parcela.percentual <= 0 || parcela.percentual > 100) {
            throw new BadRequestException('Percentual da parcela deve estar entre 0 e 100');
          }
          totalPercentual += parcela.percentual;
        }
        
        if (Math.abs(totalPercentual - 100) > 0.01) {
          throw new BadRequestException('A soma dos percentuais das parcelas deve ser 100%');
        }
        break;

      default:
        throw new BadRequestException('Tipo de prazo inválido');
    }
  }
}
