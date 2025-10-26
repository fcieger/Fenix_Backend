import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Nfe } from './entities/nfe.entity';
import { NfeItem } from './entities/nfe-item.entity';
import { NfeDuplicata } from './entities/nfe-duplicata.entity';
import { CreateNfeDto } from './dto/create-nfe.dto';
import { UpdateNfeDto } from './dto/update-nfe.dto';
import { NfeResponseDto } from './dto/nfe-response.dto';
import { CalcularImpostosDto } from './dto/calcular-impostos.dto';
import { plainToClass } from 'class-transformer';
import { ConfiguracaoNfeService } from '../configuracao-nfe/configuracao-nfe.service';
import { NaturezaOperacaoService } from '../natureza-operacao/natureza-operacao.service';
import { NfeStatus } from './enums/nfe-status.enum';

@Injectable()
export class NfeService {
  constructor(
    @InjectRepository(Nfe)
    private readonly nfeRepository: Repository<Nfe>,
    @InjectRepository(NfeItem)
    private readonly nfeItemRepository: Repository<NfeItem>,
    @InjectRepository(NfeDuplicata)
    private readonly nfeDuplicataRepository: Repository<NfeDuplicata>,
    private readonly dataSource: DataSource,
    private readonly configuracaoNfeService: ConfiguracaoNfeService,
    private readonly naturezaOperacaoService: NaturezaOperacaoService,
  ) {}

  /**
   * Criar nova NFe (rascunho)
   */
  async create(
    companyId: string,
    createDto: CreateNfeDto,
  ): Promise<NfeResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🔧 Debug Create NFe:', {
        companyId,
        createDto: {
          configuracaoNfeId: createDto.configuracaoNfeId,
          naturezaOperacaoId: createDto.naturezaOperacaoId,
          itensCount: createDto.itens.length,
          destinatarioUF: createDto.destinatarioUF,
          destinatarioTipo: createDto.destinatarioTipo,
        },
      });

      // Buscar configuração NFe
      const configuracao =
        await this.configuracaoNfeService.findOneWithCredentials(
          createDto.configuracaoNfeId,
          companyId,
        );

      if (!configuracao.ativo) {
        throw new BadRequestException('Configuração de NFe está inativa.');
      }

      // Incrementar número da NFe
      const numeroNfe = await this.configuracaoNfeService.incrementarNumero(
        createDto.configuracaoNfeId,
        companyId,
      );

      // Calcular impostos se não foram fornecidos
      let totaisCalculados = createDto.totais;
      if (!totaisCalculados) {
        totaisCalculados = await this.calcularImpostos({
          naturezaOperacaoId: createDto.naturezaOperacaoId,
          ufOrigem: 'SP', // TODO: Buscar UF da empresa
          ufDestino: createDto.destinatarioUF,
          itens: createDto.itens,
          destinatarioTipo: createDto.destinatarioTipo,
        });
      }

      // Garantir que totaisCalculados não seja undefined
      if (!totaisCalculados) {
        totaisCalculados = {
          valorTotalProdutos: 0,
          baseCalculoICMS: 0,
          valorICMS: 0,
          baseCalculoICMSST: 0,
          valorICMSST: 0,
          valorFrete: 0,
          valorSeguro: 0,
          valorDesconto: 0,
          outrasDespesas: 0,
          valorIPI: 0,
          valorPIS: 0,
          valorCOFINS: 0,
          tributosAproximados: 0,
          valorTotalNota: 0,
        };
      }

      // Criar NFe
      const nfe = this.nfeRepository.create({
        companyId,
        numeroNfe: numeroNfe.toString().padStart(9, '0'),
        serie: configuracao.serie,
        modelo: configuracao.modelo,
        configuracaoNfeId: createDto.configuracaoNfeId,
        status: NfeStatus.RASCUNHO,
        ambiente: configuracao.ambiente as any,
        tipoOperacao: createDto.tipoOperacao,
        finalidade: createDto.finalidade,
        naturezaOperacaoId: createDto.naturezaOperacaoId,
        consumidorFinal: createDto.consumidorFinal,
        indicadorPresenca: createDto.indicadorPresenca,
        // Destinatário
        destinatarioId: createDto.destinatarioId,
        destinatarioTipo: createDto.destinatarioTipo,
        destinatarioCnpjCpf: createDto.destinatarioCnpjCpf,
        destinatarioRazaoSocial: createDto.destinatarioRazaoSocial,
        destinatarioNomeFantasia: createDto.destinatarioNomeFantasia,
        destinatarioIE: createDto.destinatarioIE,
        destinatarioIM: createDto.destinatarioIM,
        destinatarioIndicadorIE: createDto.destinatarioIndicadorIE,
        destinatarioLogradouro: createDto.destinatarioLogradouro,
        destinatarioNumero: createDto.destinatarioNumero,
        destinatarioComplemento: createDto.destinatarioComplemento,
        destinatarioBairro: createDto.destinatarioBairro,
        destinatarioMunicipio: createDto.destinatarioMunicipio,
        destinatarioUF: createDto.destinatarioUF,
        destinatarioCEP: createDto.destinatarioCEP,
        destinatarioCodigoMunicipio: createDto.destinatarioCodigoMunicipio,
        destinatarioPais: createDto.destinatarioPais || 'Brasil',
        destinatarioCodigoPais: createDto.destinatarioCodigoPais || '1058',
        destinatarioTelefone: createDto.destinatarioTelefone,
        destinatarioEmail: createDto.destinatarioEmail,
        // Datas
        dataEmissao: createDto.dataEmissao,
        dataSaida: createDto.dataSaida,
        horaSaida: createDto.horaSaida,
        // Totais
        valorTotalProdutos: totaisCalculados.valorTotalProdutos || 0,
        baseCalculoICMS: totaisCalculados.baseCalculoICMS || 0,
        valorICMS: totaisCalculados.valorICMS || 0,
        baseCalculoICMSST: totaisCalculados.baseCalculoICMSST || 0,
        valorICMSST: totaisCalculados.valorICMSST || 0,
        valorFrete: totaisCalculados.valorFrete || 0,
        valorSeguro: totaisCalculados.valorSeguro || 0,
        valorDesconto: totaisCalculados.valorDesconto || 0,
        outrasDespesas: totaisCalculados.outrasDespesas || 0,
        valorIPI: totaisCalculados.valorIPI || 0,
        valorPIS: totaisCalculados.valorPIS || 0,
        valorCOFINS: totaisCalculados.valorCOFINS || 0,
        tributosAproximados: totaisCalculados.tributosAproximados || 0,
        valorTotalNota: totaisCalculados.valorTotalNota || 0,
        // Transporte
        modalidadeFrete: createDto.modalidadeFrete,
        incluirFreteTotal: createDto.incluirFreteTotal || false,
        transportadoraId: createDto.transportadoraId,
        transportadoraNome: createDto.transportadoraNome,
        transportadoraCnpj: createDto.transportadoraCnpj,
        transportadoraIE: createDto.transportadoraIE,
        veiculoPlaca: createDto.veiculoPlaca,
        veiculoUF: createDto.veiculoUF,
        volumes: createDto.volumes,
        // Pagamento
        formaPagamento: createDto.formaPagamento,
        meioPagamento: createDto.meioPagamento,
        // Informações adicionais
        informacoesComplementares: createDto.informacoesComplementares,
        informacoesFisco: createDto.informacoesFisco,
        numeroPedido: createDto.numeroPedido,
      });

      const savedNfe = await queryRunner.manager.save(nfe);

      // Criar itens
      const itens = createDto.itens.map((itemDto, index) => {
        return this.nfeItemRepository.create({
          nfeId: savedNfe.id,
          produtoId: itemDto.produtoId,
          numeroItem: index + 1,
          codigo: itemDto.codigo,
          descricao: itemDto.descricao,
          ncm: itemDto.ncm,
          cest: itemDto.cest,
          cfop: itemDto.cfop,
          unidadeComercial: itemDto.unidadeComercial,
          unidadeTributavel: itemDto.unidadeTributavel,
          quantidade: itemDto.quantidade,
          quantidadeTributavel: itemDto.quantidadeTributavel,
          valorUnitario: itemDto.valorUnitario,
          valorUnitarioTributavel: itemDto.valorUnitarioTributavel,
          valorTotal: itemDto.valorTotal,
          valorDesconto: itemDto.valorDesconto || 0,
          valorFrete: itemDto.valorFrete || 0,
          valorSeguro: itemDto.valorSeguro || 0,
          outrasDespesas: itemDto.outrasDespesas || 0,
          impostoICMS: itemDto.impostoICMS,
          impostoIPI: itemDto.impostoIPI,
          impostoPIS: itemDto.impostoPIS,
          impostoCOFINS: itemDto.impostoCOFINS,
          observacoes: itemDto.observacoes,
        });
      });

      await queryRunner.manager.save(NfeItem, itens);

      // Criar duplicatas se fornecidas
      if (createDto.duplicatas?.length) {
        const duplicatas = createDto.duplicatas.map((dupDto) => {
          return this.nfeDuplicataRepository.create({
            nfeId: savedNfe.id,
            numero: dupDto.numero,
            dataVencimento: dupDto.dataVencimento,
            valor: dupDto.valor,
          });
        });

        await queryRunner.manager.save(NfeDuplicata, duplicatas);
      }

      await queryRunner.commitTransaction();

      // Buscar NFe completa com relacionamentos
      const nfeCompleta = await this.nfeRepository.findOne({
        where: { id: savedNfe.id, companyId },
        relations: ['itens', 'duplicatas'],
      });

      return plainToClass(NfeResponseDto, nfeCompleta, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Erro ao criar NFe:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Listar todas as NFes da empresa
   */
  async findAll(companyId: string, filters?: any) {
    console.log('🔧 Debug findAll - companyId recebido:', companyId);

    // Consulta SQL direta para debug
    console.log('🔧 Debug findAll - Executando consulta SQL direta');
    const nfes = await this.nfeRepository.query(
      'SELECT id, "companyId", "numeroNfe", status, "dataEmissao", "valorTotalNota", "destinatarioRazaoSocial", "destinatarioCnpjCpf", "destinatarioUF" FROM nfe WHERE "companyId" = $1 ORDER BY "dataEmissao" DESC',
      [companyId],
    );

    console.log('🔧 Debug findAll - NFes encontradas:', nfes.length);
    console.log('🔧 Debug findAll - Dados brutos:', nfes);

    // Retornar dados reais do banco
    return nfes.map((nfe) => ({
      id: nfe.id,
      companyId: nfe.companyId,
      numeroNfe: nfe.numeroNfe,
      status: nfe.status,
      dataEmissao: nfe.dataEmissao,
      valorTotalNota: nfe.valorTotalNota,
      destinatarioRazaoSocial: nfe.destinatarioRazaoSocial,
      destinatarioCnpjCpf: nfe.destinatarioCnpjCpf,
      destinatarioUF: nfe.destinatarioUF,
      itens: [],
    }));
  }

  /**
   * Buscar NFe específica
   */
  async findOne(id: string, companyId: string): Promise<NfeResponseDto> {
    const nfe = await this.nfeRepository.findOne({
      where: { id, companyId },
      relations: ['itens', 'duplicatas'],
    });

    if (!nfe) {
      throw new NotFoundException('NFe não encontrada.');
    }

    return plainToClass(NfeResponseDto, nfe, { excludeExtraneousValues: true });
  }

  /**
   * Atualizar NFe
   */
  async update(
    id: string,
    companyId: string,
    updateDto: UpdateNfeDto,
  ): Promise<NfeResponseDto> {
    const nfe = await this.nfeRepository.findOne({
      where: { id, companyId },
      relations: ['itens', 'duplicatas'],
    });

    if (!nfe) {
      throw new NotFoundException('NFe não encontrada.');
    }

    if (nfe.status !== NfeStatus.RASCUNHO) {
      throw new BadRequestException(
        'Apenas NFes em rascunho podem ser editadas.',
      );
    }

    // Atualizar campos da NFe
    Object.assign(nfe, updateDto);

    // Se houver itens, atualizar
    if (updateDto.itens) {
      // Remover itens existentes
      await this.nfeItemRepository.delete({ nfeId: id });

      // Criar novos itens
      const itens = updateDto.itens.map((itemDto, index) => {
        return this.nfeItemRepository.create({
          nfeId: id,
          produtoId: itemDto.produtoId,
          numeroItem: index + 1,
          ...itemDto,
        });
      });

      await this.nfeItemRepository.save(itens);
    }

    // Se houver duplicatas, atualizar
    if (updateDto.duplicatas) {
      // Remover duplicatas existentes
      await this.nfeDuplicataRepository.delete({ nfeId: id });

      // Criar novas duplicatas
      const duplicatas = updateDto.duplicatas.map((dupDto) => {
        return this.nfeDuplicataRepository.create({
          nfeId: id,
          ...dupDto,
        });
      });

      await this.nfeDuplicataRepository.save(duplicatas);
    }

    const savedNfe = await this.nfeRepository.save(nfe);

    // Buscar NFe completa
    const nfeCompleta = await this.nfeRepository.findOne({
      where: { id, companyId },
      relations: ['itens', 'duplicatas'],
    });

    return plainToClass(NfeResponseDto, nfeCompleta, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Deletar NFe
   */
  async remove(id: string, companyId: string): Promise<void> {
    const nfe = await this.nfeRepository.findOne({
      where: { id, companyId },
    });

    if (!nfe) {
      throw new NotFoundException('NFe não encontrada.');
    }

    if (nfe.status !== NfeStatus.RASCUNHO) {
      throw new BadRequestException(
        'Apenas NFes em rascunho podem ser deletadas.',
      );
    }

    await this.nfeRepository.remove(nfe);
  }

  /**
   * Calcular impostos dos itens
   */
  async calcularImpostos(calcularDto: CalcularImpostosDto): Promise<any> {
    try {
      console.log('🔧 Debug Calcular Impostos:', {
        naturezaOperacaoId: calcularDto.naturezaOperacaoId,
        ufOrigem: calcularDto.ufOrigem,
        ufDestino: calcularDto.ufDestino,
        itensCount: calcularDto.itens.length,
      });

      // Por enquanto, implementação simples de cálculo de impostos
      // TODO: Implementar cálculo real baseado nas configurações de estado
      let valorTotalProdutos = 0;
      let valorICMS = 0;
      let valorIPI = 0;
      let valorPIS = 0;
      let valorCOFINS = 0;

      // Calcular totais dos itens
      for (const item of calcularDto.itens) {
        valorTotalProdutos += item.valorTotal;

        // Cálculo simples de impostos (alíquotas fixas por enquanto)
        const baseICMS = item.valorTotal;
        const aliquotaICMS = 18; // 18% por enquanto
        const aliquotaIPI = 10; // 10% por enquanto
        const aliquotaPIS = 1.65; // 1.65% por enquanto
        const aliquotaCOFINS = 7.6; // 7.6% por enquanto

        valorICMS += (baseICMS * aliquotaICMS) / 100;
        valorIPI += (baseICMS * aliquotaIPI) / 100;
        valorPIS += (baseICMS * aliquotaPIS) / 100;
        valorCOFINS += (baseICMS * aliquotaCOFINS) / 100;
      }

      const resultado = {
        valorTotalProdutos,
        baseCalculoICMS: valorTotalProdutos,
        valorICMS,
        baseCalculoICMSST: 0,
        valorICMSST: 0,
        valorFrete: 0,
        valorSeguro: 0,
        valorDesconto: 0,
        outrasDespesas: 0,
        valorIPI,
        valorPIS,
        valorCOFINS,
        tributosAproximados: valorICMS + valorIPI + valorPIS + valorCOFINS,
        valorTotalNota:
          valorTotalProdutos + valorICMS + valorIPI + valorPIS + valorCOFINS,
      };

      console.log('✅ Impostos calculados:', resultado);
      return resultado;
    } catch (error) {
      console.error('❌ Erro ao calcular impostos:', error);
      throw error;
    }
  }
}
