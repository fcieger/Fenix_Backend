import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NaturezaOperacao } from '../natureza-operacao/entities/natureza-operacao.entity';
import { ConfiguracaoImpostoEstado } from '../natureza-operacao/entities/configuracao-imposto-estado.entity';
import { Company } from '../companies/entities/company.entity';
import { Cadastro } from '../cadastros/entities/cadastro.entity';
import {
  CalcularImpostosPedidoDto,
  CalcularImpostosResponseDto,
  ImpostosItemCalculado,
} from './dto/calcular-impostos.dto';
import {
  ICMS_STRATEGIES,
  IPI_STRATEGIES,
  PIS_STRATEGIES,
  COFINS_STRATEGIES,
  baseCalc,
} from './strategies';

@Injectable()
export class CalculadoraImpostosService {
  constructor(
    @InjectRepository(NaturezaOperacao)
    private naturezaRepo: Repository<NaturezaOperacao>,
    @InjectRepository(ConfiguracaoImpostoEstado)
    private confEstadoRepo: Repository<ConfiguracaoImpostoEstado>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
    @InjectRepository(Cadastro)
    private cadastroRepo: Repository<Cadastro>,
  ) {}

  async calcularPedido(
    dto: CalcularImpostosPedidoDto,
  ): Promise<CalcularImpostosResponseDto> {
    console.log('🔍 Calculando impostos para:', dto);

    // 1. Buscar empresa para obter UF origem
    const empresa = await this.companyRepo.findOne({
      where: { id: dto.companyId },
    });
    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }
    const ufOrigem = empresa.address?.state || 'SP';
    console.log('✅ UF Origem:', ufOrigem);

    // 2. Buscar cliente para obter UF destino
    let ufDestino = 'SP'; // fallback
    if (dto.clienteId) {
      const cliente = await this.cadastroRepo.findOne({
        where: { id: dto.clienteId },
      });
      if (cliente && cliente.enderecos && cliente.enderecos.length > 0) {
        const enderecoPrincipal =
          cliente.enderecos.find((e) => e.principal) || cliente.enderecos[0];
        ufDestino = enderecoPrincipal.estado || 'SP';
      }
    }
    console.log('✅ UF Destino:', ufDestino);

    // 3. Buscar natureza de operação
    const natureza = await this.naturezaRepo.findOne({
      where: { id: dto.naturezaOperacaoId },
    });
    if (!natureza) {
      throw new NotFoundException('Natureza de operação não encontrada');
    }
    console.log('✅ Natureza encontrada:', natureza.nome);

    // 4. Buscar configuração de impostos por estado
    console.log('🔍 Buscando configuração para:', {
      naturezaOperacaoId: dto.naturezaOperacaoId,
      ufDestino,
      ufOrigem,
    });

    let confEstado = await this.confEstadoRepo.findOne({
      where: {
        naturezaOperacaoId: dto.naturezaOperacaoId,
        uf: ufDestino,
      },
    });
    console.log(
      '🔍 Configuração encontrada para UF destino:',
      confEstado ? 'Sim' : 'Não',
    );

    // Se não encontrar para UF destino, buscar para UF origem
    if (!confEstado) {
      confEstado = await this.confEstadoRepo.findOne({
        where: {
          naturezaOperacaoId: dto.naturezaOperacaoId,
          uf: ufOrigem,
        },
      });
      console.log(
        '🔍 Configuração encontrada para UF origem:',
        confEstado ? 'Sim' : 'Não',
      );
    }

    // Buscar todas as configurações disponíveis para debug
    const todasConfiguracoes = await this.confEstadoRepo.find({
      where: { naturezaOperacaoId: dto.naturezaOperacaoId },
    });
    console.log(
      '🔍 Todas as configurações disponíveis:',
      todasConfiguracoes.map((c) => ({ uf: c.uf, habilitado: c.habilitado })),
    );

    // Se ainda não encontrar, criar configuração padrão
    if (!confEstado) {
      console.log(
        '⚠️ Configuração de imposto por estado não encontrada. Criando padrão.',
      );
      confEstado = {
        id: 'default',
        naturezaOperacaoId: dto.naturezaOperacaoId,
        uf: ufDestino,
        icmsCST: '00',
        icmsAliquota: 18,
        icmsIncluirFrete: false,
        icmsIncluirDespesas: false,
        icmsReducaoBase: 0,
        icmsMVA: 0,
        icmsStAliquota: 18,
        icmsStReducaoBase: 0,
        ipiCST: '00',
        ipiAliquota: 5,
        ipiIncluirFrete: false,
        ipiIncluirDespesas: false,
        ipiReducaoBase: 0,
        pisCST: '01',
        pisAliquota: 1.65,
        pisIncluirFrete: false,
        pisIncluirDespesas: false,
        pisReducaoBase: 0,
        cofinsCST: '01',
        cofinsAliquota: 7.6,
        cofinsIncluirFrete: false,
        cofinsIncluirDespesas: false,
        cofinsReducaoBase: 0,
        issAliquota: 5,
        issIncluirFrete: false,
        issIncluirDespesas: false,
        issReducaoBase: 0,
        csllAliquota: 1,
        csllIncluirFrete: false,
        csllIncluirDespesas: false,
        csllReducaoBase: 0,
        pisRetencaoAliquota: 0,
        pisRetencaoIncluirFrete: false,
        pisRetencaoIncluirDespesas: false,
        pisRetencaoReducaoBase: 0,
        inssAliquota: 0,
        inssIncluirFrete: false,
        inssIncluirDespesas: false,
        inssReducaoBase: 0,
        irAliquota: 0,
        irIncluirFrete: false,
        irIncluirDespesas: false,
        irReducaoBase: 0,
        cofinsRetencaoAliquota: 0,
        cofinsRetencaoIncluirFrete: false,
        cofinsRetencaoIncluirDespesas: false,
        cofinsRetencaoReducaoBase: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    }

    console.log('✅ Configuração utilizada:', {
      ufOrigem,
      ufDestino,
      confEstado,
    });

    // 5. Calcular impostos usando as configurações reais
    const incluirFrete = !!dto.incluirFreteTotal;
    const totalFrete = Number(dto.valorFrete || 0);
    const totalDespesas = Number(dto.despesas || 0);
    const totalQtd = dto.itens.reduce((s, it) => s + it.quantidade, 0) || 1;

    const itensCalc: ImpostosItemCalculado[] = dto.itens.map((it) => {
      const subtotal = it.quantidade * it.valorUnitario;
      const desconto = Number(it.valorDesconto || 0);
      const freteItem = incluirFrete
        ? totalFrete * (it.quantidade / totalQtd)
        : 0;
      const despItem = totalDespesas * (it.quantidade / totalQtd);

      // Usar CSTs do item ou da configuração
      const cstIcms = it.icmsCST || confEstado?.icmsCST || '00';
      const cstIpi = it.ipiCST || confEstado?.ipiCST || '00';
      const cstPis = it.pisCST || confEstado?.pisCST || '01';
      const cstCofins = it.cofinsCST || confEstado?.cofinsCST || '01';

      // Calcular impostos usando as estratégias CST
      const { icms, icmsSt } = (
        ICMS_STRATEGIES[cstIcms] || ICMS_STRATEGIES.DEFAULT
      )({
        subtotal,
        desconto,
        freteItem,
        despItem,
        conf: confEstado,
        cbenef: it.cbenef,
      });

      const { ipi } = (IPI_STRATEGIES[cstIpi] || IPI_STRATEGIES.DEFAULT)({
        subtotal,
        desconto,
        freteItem,
        despItem,
        conf: confEstado,
        cbenef: it.cbenef,
        qtd: it.quantidade,
      });

      const pis = (PIS_STRATEGIES[cstPis] || PIS_STRATEGIES.DEFAULT)({
        subtotal,
        desconto,
        freteItem,
        despItem,
        conf: confEstado,
        cbenef: it.cbenef,
        qtd: it.quantidade,
      });

      const cofins = (
        COFINS_STRATEGIES[cstCofins] || COFINS_STRATEGIES.DEFAULT
      )({
        subtotal,
        desconto,
        freteItem,
        despItem,
        conf: confEstado,
        cbenef: it.cbenef,
        qtd: it.quantidade,
      });

      // ISS
      const baseIss = baseCalc({
        subtotal,
        desconto,
        freteItem,
        despItem,
        incluiFrete: !!(confEstado as any)?.issIncluirFrete,
        incluiDesp: !!(confEstado as any)?.issIncluirDespesas,
      });
      const issElegivel =
        !(confEstado as any)?.issAcimaDe ||
        baseIss >= Number((confEstado as any)?.issAcimaDe || 0);
      const issAliq = Number(
        ((confEstado as any)?.issAliquota ??
          (confEstado as any)?.issPorcentagem) ||
          0,
      );
      const iss =
        issElegivel && baseIss > 0 && issAliq > 0
          ? {
              base: baseIss,
              aliquota: issAliq,
              valor: Number(((baseIss * issAliq) / 100).toFixed(2)),
              cst: (confEstado as any)?.issCST,
            }
          : undefined;

      const totalImpostos = [ipi, icms, icmsSt, pis, cofins, iss]
        .filter(Boolean)
        .reduce((s, v: any) => s + Number(v.valor || 0), 0);

      return {
        produtoId: it.produtoId,
        nome: it.nome,
        quantidade: it.quantidade,
        valorUnitario: it.valorUnitario,
        subtotal,
        desconto,
        baseCalculo: baseCalc({ subtotal, desconto, freteItem, despItem }),
        pis,
        cofins,
        iss,
        ipi,
        icms,
        icmsSt,
        totalImpostos,
      };
    });

    const totalProdutos = itensCalc.reduce((s, i) => s + i.subtotal, 0);
    const totalDescontos = itensCalc.reduce((s, i) => s + i.desconto, 0);
    const totalImpostos = itensCalc.reduce((s, i) => s + i.totalImpostos, 0);
    const totalPedido =
      totalProdutos -
      totalDescontos +
      totalImpostos +
      Number(dto.valorFrete || 0) +
      Number(dto.despesas || 0);

    return {
      itens: itensCalc,
      totais: { totalProdutos, totalDescontos, totalImpostos, totalPedido },
    };
  }
}
