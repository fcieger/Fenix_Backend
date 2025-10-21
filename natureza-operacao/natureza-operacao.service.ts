import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NaturezaOperacao } from './entities/natureza-operacao.entity';
import { ConfiguracaoImpostoEstado } from './entities/configuracao-imposto-estado.entity';
import { CreateNaturezaOperacaoDto } from './dto/create-natureza-operacao.dto';
import { UpdateNaturezaOperacaoDto } from './dto/update-natureza-operacao.dto';
import { ConfiguracaoEstadoDto } from './dto/configuracao-estado.dto';

@Injectable()
export class NaturezaOperacaoService {
  constructor(
    @InjectRepository(NaturezaOperacao)
    private naturezaOperacaoRepository: Repository<NaturezaOperacao>,
    @InjectRepository(ConfiguracaoImpostoEstado)
    private configuracaoImpostoEstadoRepository: Repository<ConfiguracaoImpostoEstado>,
  ) {}

  async create(createDto: CreateNaturezaOperacaoDto, companyId: string): Promise<NaturezaOperacao> {
    if (!companyId) {
      throw new Error('CompanyId é obrigatório');
    }

    const naturezaOperacao = this.naturezaOperacaoRepository.create({
      ...createDto,
      companyId,
      tipoDataContasReceberPagar: createDto.tipoDataContasReceberPagar || null,
    });

    return this.naturezaOperacaoRepository.save(naturezaOperacao);
  }

  async findAll(companyId: string): Promise<NaturezaOperacao[]> {
    return this.naturezaOperacaoRepository.find({
      where: { companyId },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<NaturezaOperacao> {
    const naturezaOperacao = await this.naturezaOperacaoRepository.findOne({
      where: { id, companyId },
    });

    if (!naturezaOperacao) {
      throw new NotFoundException('Natureza de operação não encontrada');
    }

    return naturezaOperacao;
  }

  async update(id: string, updateDto: UpdateNaturezaOperacaoDto, companyId: string): Promise<NaturezaOperacao> {
    const naturezaOperacao = await this.findOne(id, companyId);
    
    Object.assign(naturezaOperacao, updateDto);
    
    return this.naturezaOperacaoRepository.save(naturezaOperacao);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const naturezaOperacao = await this.findOne(id, companyId);
    
    // Deletar configurações de estados relacionadas
    await this.configuracaoImpostoEstadoRepository.delete({ naturezaOperacaoId: id });
    
    await this.naturezaOperacaoRepository.remove(naturezaOperacao);
  }

  async getConfiguracaoEstados(naturezaOperacaoId: string, companyId: string): Promise<ConfiguracaoImpostoEstado[]> {
    console.log('=== GET CONFIGURAÇÃO ESTADOS ===');
    console.log('NaturezaOperacaoId:', naturezaOperacaoId);
    console.log('CompanyId:', companyId);
    
    try {
      // Verificar se a natureza de operação pertence à empresa
      await this.findOne(naturezaOperacaoId, companyId);

      const configuracoes = await this.configuracaoImpostoEstadoRepository.find({
        where: { naturezaOperacaoId },
        order: { uf: 'ASC' },
      });
      
      console.log('Configurações encontradas:', configuracoes.length);
      return configuracoes;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    }
  }

  async saveConfiguracaoEstados(
    naturezaOperacaoId: string, 
    configuracaoEstados: ConfiguracaoEstadoDto[], 
    companyId: string
  ): Promise<void> {
    // Verificar se a natureza de operação pertence à empresa
    await this.findOne(naturezaOperacaoId, companyId);

    // Deletar configurações existentes
    await this.configuracaoImpostoEstadoRepository.delete({ naturezaOperacaoId });

    // Criar novas configurações
    const configuracoes = configuracaoEstados.map(config => {
      return this.configuracaoImpostoEstadoRepository.create({
        ...config,
        naturezaOperacaoId,
      });
    });

    await this.configuracaoImpostoEstadoRepository.save(configuracoes);
  }
}




