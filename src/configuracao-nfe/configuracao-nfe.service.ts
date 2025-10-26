import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracaoNfe } from './entities/configuracao-nfe.entity';
import { CreateConfiguracaoNfeDto } from './dto/create-configuracao-nfe.dto';
import { UpdateConfiguracaoNfeDto } from './dto/update-configuracao-nfe.dto';
import { ConfiguracaoNfeCryptoService } from './configuracao-nfe-crypto.service';
import { plainToClass } from 'class-transformer';
import { ConfiguracaoNfeResponseDto } from './dto/configuracao-nfe-response.dto';

@Injectable()
export class ConfiguracaoNfeService {
  constructor(
    @InjectRepository(ConfiguracaoNfe)
    private readonly configuracaoNfeRepository: Repository<ConfiguracaoNfe>,
    private readonly cryptoService: ConfiguracaoNfeCryptoService,
  ) {}

  /**
   * Criar nova configuração de NFe
   */
  async create(
    companyId: string,
    createDto: CreateConfiguracaoNfeDto,
  ): Promise<ConfiguracaoNfeResponseDto> {
    try {
      console.log('🔧 Debug Create ConfiguracaoNfe:', {
        companyId,
        createDto,
      });

      // Verificar se já existe configuração com mesmo modelo e série
      console.log('🔍 Verificando configuração existente...');
      const existing = await this.configuracaoNfeRepository.findOne({
        where: {
          companyId,
          modelo: createDto.modelo,
          serie: createDto.serie,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Já existe uma configuração com modelo "${createDto.modelo}" e série "${createDto.serie}" para esta empresa.`,
        );
      }

      // Criar nova configuração
      console.log(
        '✅ Nenhuma configuração existente encontrada. Criando nova...',
      );
      const configuracao = this.configuracaoNfeRepository.create({
        ...createDto,
        companyId,
      });

      // Criptografar senhas antes de salvar
      if (createDto.rpsSenhaPrefeitura) {
        console.log('🔐 Criptografando rpsSenhaPrefeitura...');
        configuracao.rpsSenhaPrefeitura = this.cryptoService.encrypt(
          createDto.rpsSenhaPrefeitura,
        );
      }

      if (createDto.nfceCscToken) {
        console.log('🔐 Criptografando nfceCscToken...');
        configuracao.nfceCscToken = this.cryptoService.encrypt(
          createDto.nfceCscToken,
        );
      }

      console.log('💾 Salvando configuração no banco de dados...');
      const saved = await this.configuracaoNfeRepository.save(configuracao);
      console.log('✅ Configuração salva com sucesso!', saved.id);

      // Retornar DTO de resposta sem campos sensíveis
      return plainToClass(ConfiguracaoNfeResponseDto, saved, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('❌ Erro ao criar configuração NFe:', {
        message: error.message,
        stack: error.stack,
        companyId,
        createDto,
      });
      throw error;
    }
  }

  /**
   * Listar todas as configurações da empresa
   */
  async findAll(
    companyId: string,
    apenasAtivas: boolean = false,
  ): Promise<ConfiguracaoNfeResponseDto[]> {
    const where: any = { companyId };

    if (apenasAtivas) {
      where.ativo = true;
    }

    const configuracoes = await this.configuracaoNfeRepository.find({
      where,
      order: {
        descricaoModelo: 'ASC',
      },
    });

    return configuracoes.map((config) =>
      plainToClass(ConfiguracaoNfeResponseDto, config, {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Buscar configuração específica
   */
  async findOne(
    id: string,
    companyId: string,
  ): Promise<ConfiguracaoNfeResponseDto> {
    const configuracao = await this.configuracaoNfeRepository.findOne({
      where: { id, companyId },
    });

    if (!configuracao) {
      throw new NotFoundException('Configuração de NFe não encontrada.');
    }

    return plainToClass(ConfiguracaoNfeResponseDto, configuracao, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Buscar configuração com credenciais descriptografadas (uso interno)
   */
  async findOneWithCredentials(
    id: string,
    companyId: string,
  ): Promise<ConfiguracaoNfe> {
    const configuracao = await this.configuracaoNfeRepository.findOne({
      where: { id, companyId },
    });

    if (!configuracao) {
      throw new NotFoundException('Configuração de NFe não encontrada.');
    }

    // Descriptografar senhas
    if (configuracao.rpsSenhaPrefeitura) {
      configuracao.rpsSenhaPrefeitura = this.cryptoService.decrypt(
        configuracao.rpsSenhaPrefeitura,
      );
    }

    if (configuracao.nfceCscToken) {
      configuracao.nfceCscToken = this.cryptoService.decrypt(
        configuracao.nfceCscToken,
      );
    }

    return configuracao;
  }

  /**
   * Atualizar configuração
   */
  async update(
    id: string,
    companyId: string,
    updateDto: UpdateConfiguracaoNfeDto,
  ): Promise<ConfiguracaoNfeResponseDto> {
    const configuracao = await this.configuracaoNfeRepository.findOne({
      where: { id, companyId },
    });

    if (!configuracao) {
      throw new NotFoundException('Configuração de NFe não encontrada.');
    }

    // Se estiver alterando modelo ou série, verificar unicidade
    if (
      (updateDto.modelo && updateDto.modelo !== configuracao.modelo) ||
      (updateDto.serie && updateDto.serie !== configuracao.serie)
    ) {
      const novoModelo = updateDto.modelo || configuracao.modelo;
      const novaSerie = updateDto.serie || configuracao.serie;

      const existing = await this.configuracaoNfeRepository.findOne({
        where: {
          companyId,
          modelo: novoModelo,
          serie: novaSerie,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Já existe uma configuração com modelo "${novoModelo}" e série "${novaSerie}" para esta empresa.`,
        );
      }
    }

    // Atualizar campos
    Object.assign(configuracao, updateDto);

    // Criptografar senhas se foram alteradas
    if (updateDto.rpsSenhaPrefeitura) {
      configuracao.rpsSenhaPrefeitura = this.cryptoService.encrypt(
        updateDto.rpsSenhaPrefeitura,
      );
    }

    if (updateDto.nfceCscToken) {
      configuracao.nfceCscToken = this.cryptoService.encrypt(
        updateDto.nfceCscToken,
      );
    }

    const saved = await this.configuracaoNfeRepository.save(configuracao);

    return plainToClass(ConfiguracaoNfeResponseDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Desativar configuração (soft delete)
   */
  async remove(id: string, companyId: string): Promise<void> {
    const configuracao = await this.configuracaoNfeRepository.findOne({
      where: { id, companyId },
    });

    if (!configuracao) {
      throw new NotFoundException('Configuração de NFe não encontrada.');
    }

    configuracao.ativo = false;
    await this.configuracaoNfeRepository.save(configuracao);
  }

  /**
   * Incrementar número atual (usado ao emitir nota)
   */
  async incrementarNumero(id: string, companyId: string): Promise<number> {
    const configuracao = await this.configuracaoNfeRepository.findOne({
      where: { id, companyId },
    });

    if (!configuracao) {
      throw new NotFoundException('Configuração de NFe não encontrada.');
    }

    if (!configuracao.ativo) {
      throw new BadRequestException('Configuração está inativa.');
    }

    configuracao.numeroAtual += 1;
    const saved = await this.configuracaoNfeRepository.save(configuracao);

    return saved.numeroAtual;
  }

  /**
   * Teste de conexão com banco
   */
  async testDatabase(): Promise<boolean> {
    try {
      // Tentar fazer uma query simples na tabela
      const count = await this.configuracaoNfeRepository.count();
      return true;
    } catch (error) {
      console.error('Database test error:', error);
      return false;
    }
  }
}
