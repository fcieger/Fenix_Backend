import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PedidoVenda } from '../pedidos-venda/entities/pedido-venda.entity';
import { Produto } from '../produtos/entities/produto.entity';
import { Cadastro } from '../cadastros/entities/cadastro.entity';

@Injectable()
export class ChatToolsService {
  private readonly logger = new Logger(ChatToolsService.name);

  constructor(
    @InjectRepository(PedidoVenda)
    private pedidosVendaRepository: Repository<PedidoVenda>,
    @InjectRepository(Produto)
    private produtosRepository: Repository<Produto>,
    @InjectRepository(Cadastro)
    private cadastrosRepository: Repository<Cadastro>,
  ) {}

  /**
   * Busca vendas da empresa em um período
   */
  async buscarVendas(userId: string, companyId: string, dataInicio?: string, dataFim?: string) {
    try {
      this.logger.log(`📊 ===== BUSCAR VENDAS =====`);
      this.logger.log(`👤 User ID: ${userId}`);
      this.logger.log(`🏢 Company ID: ${companyId}`);
      this.logger.log(`📅 Período: ${dataInicio || 'início do mês'} até ${dataFim || 'hoje'}`);

      // Definir período padrão (último mês se não informado)
      const hoje = new Date();
      const inicio = dataInicio 
        ? new Date(dataInicio) 
        : new Date(hoje.getFullYear(), hoje.getMonth(), 1); // Primeiro dia do mês
      
      const fim = dataFim 
        ? new Date(dataFim) 
        : hoje;

      this.logger.log(`📅 Período convertido: ${inicio.toISOString()} até ${fim.toISOString()}`);

      // Buscar vendas do período
      const vendas = await this.pedidosVendaRepository.find({
        where: {
          companyId,
          createdAt: Between(inicio, fim),
        },
        relations: ['cliente'],
        order: {
          createdAt: 'DESC',
        },
      });

      this.logger.log(`📦 Vendas encontradas no banco: ${vendas.length}`);

      // Calcular estatísticas
      const totalVendas = vendas.length;
      const valorTotal = vendas.reduce((acc, venda) => acc + (Number(venda.totalGeral) || 0), 0);
      const ticketMedio = totalVendas > 0 ? valorTotal / totalVendas : 0;
      
      // Vendas por status
      const porStatus = {
        rascunho: vendas.filter(v => v.status === 'rascunho').length,
        pendente: vendas.filter(v => v.status === 'pendente').length,
        em_preparacao: vendas.filter(v => v.status === 'em_preparacao').length,
        enviado: vendas.filter(v => v.status === 'enviado').length,
        entregue: vendas.filter(v => v.status === 'entregue').length,
        faturado: vendas.filter(v => v.status === 'faturado').length,
        cancelado: vendas.filter(v => v.status === 'cancelado').length,
      };

      // Top 5 clientes
      const vendasPorCliente = vendas.reduce((acc, venda) => {
        const clienteNome = venda.cliente?.nomeFantasia || venda.cliente?.nomeRazaoSocial || 'Cliente não identificado';
        if (!acc[clienteNome]) {
          acc[clienteNome] = { nome: clienteNome, quantidade: 0, valor: 0 };
        }
        acc[clienteNome].quantidade++;
        acc[clienteNome].valor += Number(venda.totalGeral) || 0;
        return acc;
      }, {});

      const topClientes = Object.values(vendasPorCliente)
        .sort((a: any, b: any) => b.valor - a.valor)
        .slice(0, 5);

      const resultado = {
        periodo: {
          inicio: inicio.toISOString().split('T')[0],
          fim: fim.toISOString().split('T')[0],
        },
        resumo: {
          total_vendas: totalVendas,
          valor_total: valorTotal,
          ticket_medio: ticketMedio,
        },
        por_status: porStatus,
        top_clientes: topClientes,
        ultimas_vendas: vendas.slice(0, 5).map(v => ({
          numero: v.numero,
          cliente: v.cliente?.nomeFantasia || v.cliente?.nomeRazaoSocial || 'N/A',
          valor: Number(v.totalGeral) || 0,
          status: v.status,
          data: v.createdAt.toISOString().split('T')[0],
        })),
      };

      this.logger.log(`✅ Vendas encontradas: ${totalVendas} vendas, R$ ${valorTotal.toFixed(2)}`);
      this.logger.log(`📊 Retornando dados:`, JSON.stringify(resultado, null, 2));

      return resultado;
    } catch (error) {
      this.logger.error('❌ Erro ao buscar vendas:', error);
      return {
        erro: 'Não foi possível buscar vendas',
        mensagem: error.message,
      };
    }
  }

  /**
   * Busca produtos e informações de estoque
   */
  async buscarEstoque(userId: string, companyId: string, filtro?: string) {
    try {
      this.logger.log(`📦 ===== BUSCAR ESTOQUE =====`);
      this.logger.log(`🏢 Company ID: ${companyId}`);
      
      // Buscar saldos de estoque
      const saldos = await this.produtosRepository.manager.query(`
        SELECT 
          p.id,
          p.nome,
          p.sku,
          CAST(p.preco as DECIMAL) as preco,
          CAST(p.custo as DECIMAL) as custo,
          COALESCE(SUM(CAST(es.qtd as DECIMAL)), 0) as estoque_total,
          COUNT(DISTINCT es."localId") as locais_armazenamento
        FROM produtos p
        LEFT JOIN estoque_saldos es ON es."produtoId" = p.id
        WHERE p."companyId" = $1
          AND p.ativo = true
          ${filtro ? `AND (p.nome ILIKE '%${filtro}%' OR p.sku ILIKE '%${filtro}%')` : ''}
        GROUP BY p.id, p.nome, p.sku, p.preco, p.custo
        ORDER BY estoque_total ASC
        LIMIT 50
      `, [companyId]);

      this.logger.log(`📦 Produtos com estoque encontrados: ${saldos.length}`);

      const totalProdutos = saldos.length;
      const produtosSemEstoque = saldos.filter(s => Number(s.estoque_total || 0) === 0).length;
      const produtosEstoqueBaixo = saldos.filter(s => 
        Number(s.estoque_total || 0) > 0 && Number(s.estoque_total || 0) < 10
      ).length;
      const valorTotalEstoque = saldos.reduce((acc, s) => 
        acc + (Number(s.estoque_total || 0) * Number(s.custo || 0)), 0
      );

      const resultado = {
        total_produtos: totalProdutos,
        produtos_sem_estoque: produtosSemEstoque,
        produtos_estoque_baixo: produtosEstoqueBaixo,
        valor_total_estoque: valorTotalEstoque,
        produtos: saldos.slice(0, 20).map(s => ({
          nome: s.nome,
          sku: s.sku,
          estoque: Number(s.estoque_total || 0),
          preco_venda: Number(s.preco || 0),
          custo: Number(s.custo || 0),
          locais: Number(s.locais_armazenamento || 0),
        })),
      };

      this.logger.log(`✅ Estoque: ${totalProdutos} produtos, ${produtosSemEstoque} sem estoque`);

      return resultado;
    } catch (error) {
      this.logger.error('❌ Erro ao buscar estoque:', error);
      return { erro: 'Não foi possível buscar estoque', mensagem: error.message };
    }
  }

  /**
   * Busca informações financeiras (contas a pagar e receber)
   */
  async buscarFinanceiro(userId: string, companyId: string, tipo?: 'pagar' | 'receber' | 'ambos') {
    try {
      this.logger.log(`💰 ===== BUSCAR FINANCEIRO =====`);
      this.logger.log(`🏢 Company ID: ${companyId}`);
      this.logger.log(`📊 Tipo: ${tipo || 'ambos'}`);

      const hoje = new Date();
      const resultado: any = {};

      // Buscar contas a pagar
      if (!tipo || tipo === 'pagar' || tipo === 'ambos') {
        const contasPagar = await this.produtosRepository.manager.query(`
          SELECT 
            COUNT(*) as total,
            SUM(CAST(valor_total as DECIMAL)) as valor_total,
            SUM(CASE WHEN data_vencimento < NOW() THEN CAST(valor_total as DECIMAL) ELSE 0 END) as vencidas_valor,
            SUM(CASE WHEN data_vencimento < NOW() THEN 1 ELSE 0 END) as vencidas_quantidade
          FROM contas_pagar
          WHERE "companyId" = $1
            AND status != 'paga'
        `, [companyId]);

        resultado.contas_pagar = {
          total: parseInt(contasPagar[0]?.total || 0),
          valor_total: parseFloat(contasPagar[0]?.valor_total || 0),
          vencidas: {
            quantidade: parseInt(contasPagar[0]?.vencidas_quantidade || 0),
            valor: parseFloat(contasPagar[0]?.vencidas_valor || 0),
          },
        };
      }

      // Buscar contas a receber
      if (!tipo || tipo === 'receber' || tipo === 'ambos') {
        const contasReceber = await this.produtosRepository.manager.query(`
          SELECT 
            COUNT(*) as total,
            SUM(CAST(valor_total as DECIMAL)) as valor_total,
            SUM(CASE WHEN data_vencimento < NOW() THEN CAST(valor_total as DECIMAL) ELSE 0 END) as vencidas_valor,
            SUM(CASE WHEN data_vencimento < NOW() THEN 1 ELSE 0 END) as vencidas_quantidade
          FROM contas_receber
          WHERE "companyId" = $1
            AND status != 'recebida'
        `, [companyId]);

        resultado.contas_receber = {
          total: parseInt(contasReceber[0]?.total || 0),
          valor_total: parseFloat(contasReceber[0]?.valor_total || 0),
          vencidas: {
            quantidade: parseInt(contasReceber[0]?.vencidas_quantidade || 0),
            valor: parseFloat(contasReceber[0]?.vencidas_valor || 0),
          },
        };
      }

      // Buscar saldo das contas correntes
      const contasCorrentes = await this.produtosRepository.manager.query(`
        SELECT 
          COUNT(*) as total_contas,
          SUM(CAST(saldo as DECIMAL)) as saldo_total
        FROM contas_financeiras
        WHERE "companyId" = $1
          AND ativa = true
      `, [companyId]);

      resultado.contas_correntes = {
        total: parseInt(contasCorrentes[0]?.total_contas || 0),
        saldo_total: parseFloat(contasCorrentes[0]?.saldo_total || 0),
      };

      this.logger.log(`✅ Financeiro carregado com sucesso`);

      return resultado;
    } catch (error) {
      this.logger.error('❌ Erro ao buscar financeiro:', error);
      return { erro: 'Não foi possível buscar dados financeiros', mensagem: error.message };
    }
  }

  /**
   * Busca produtos cadastrados
   */
  async buscarProdutos(userId: string, companyId: string, filtro?: string, limite: number = 20) {
    try {
      this.logger.log(`📦 ===== BUSCAR PRODUTOS =====`);
      this.logger.log(`🏢 Company ID: ${companyId}`);

      const query = this.produtosRepository.createQueryBuilder('produto')
        .where('produto.companyId = :companyId', { companyId })
        .andWhere('produto.ativo = :ativo', { ativo: true });

      if (filtro) {
        query.andWhere(
          '(produto.nome ILIKE :filtro OR produto.sku ILIKE :filtro OR produto.descricao ILIKE :filtro)',
          { filtro: `%${filtro}%` }
        );
      }

      const produtos = await query
        .orderBy('produto.nome', 'ASC')
        .limit(limite)
        .getMany();

      this.logger.log(`📦 Produtos encontrados: ${produtos.length}`);

      return {
        total: produtos.length,
        produtos: produtos.map(p => ({
          id: p.id,
          nome: p.nome,
          sku: p.sku,
          preco_venda: Number(p.preco || 0),
          custo: Number(p.custo || 0),
          categoria: p.categoriaProduto,
          ncm: p.ncm,
          unidade: p.unidadeMedida,
        })),
      };
    } catch (error) {
      this.logger.error('❌ Erro ao buscar produtos:', error);
      return { erro: 'Não foi possível buscar produtos', mensagem: error.message };
    }
  }

  /**
   * Busca clientes cadastrados
   */
  async buscarClientes(userId: string, companyId: string, filtro?: string, limite: number = 20) {
    try {
      this.logger.log(`👥 ===== BUSCAR CLIENTES =====`);
      this.logger.log(`🏢 Company ID: ${companyId}`);

      const query = this.cadastrosRepository.createQueryBuilder('cadastro')
        .where('cadastro.companyId = :companyId', { companyId })
        .andWhere("cadastro.tiposCliente->>'cliente' = 'true'");

      if (filtro) {
        query.andWhere(
          '(cadastro.nomeRazaoSocial ILIKE :filtro OR cadastro.nomeFantasia ILIKE :filtro OR cadastro.email ILIKE :filtro)',
          { filtro: `%${filtro}%` }
        );
      }

      const clientes = await query
        .orderBy('cadastro.nomeRazaoSocial', 'ASC')
        .limit(limite)
        .getMany();

      this.logger.log(`👥 Clientes encontrados: ${clientes.length}`);

      return {
        total: clientes.length,
        clientes: clientes.map(c => ({
          id: c.id,
          nome: c.nomeFantasia || c.nomeRazaoSocial,
          cpf_cnpj: c.cnpj || c.cpf,
          email: c.email,
          telefone: c.celular || c.telefoneComercial,
          cidade: c.enderecos?.[0]?.cidade || 'N/A',
          uf: c.enderecos?.[0]?.estado || 'N/A',
        })),
      };
    } catch (error) {
      this.logger.error('❌ Erro ao buscar clientes:', error);
      return { erro: 'Não foi possível buscar clientes', mensagem: error.message };
    }
  }


  /**
   * Retorna a definição das tools disponíveis
   */
  getToolDefinitions() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'buscar_vendas',
          description: 'Busca informações sobre vendas/pedidos da empresa em um período. Retorna total de vendas, valor total, ticket médio, vendas por status, top clientes e últimas vendas.',
          parameters: {
            type: 'object',
            properties: {
              dataInicio: {
                type: 'string',
                description: 'Data de início no formato YYYY-MM-DD. Se não informada, usa o primeiro dia do mês atual.',
              },
              dataFim: {
                type: 'string',
                description: 'Data de fim no formato YYYY-MM-DD. Se não informada, usa a data atual.',
              },
            },
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'buscar_estoque',
          description: 'Busca informações sobre estoque de produtos. Retorna produtos em estoque baixo, sem estoque, valor total do estoque e lista de produtos.',
          parameters: {
            type: 'object',
            properties: {
              filtro: {
                type: 'string',
                description: 'Filtro opcional para buscar produtos específicos (nome ou SKU).',
              },
            },
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'buscar_financeiro',
          description: 'Busca informações financeiras incluindo contas a pagar, contas a receber e saldo de contas correntes. Mostra valores em aberto, vencidos e totais.',
          parameters: {
            type: 'object',
            properties: {
              tipo: {
                type: 'string',
                enum: ['pagar', 'receber', 'ambos'],
                description: 'Tipo de conta: pagar (contas a pagar), receber (contas a receber), ou ambos.',
              },
            },
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'buscar_produtos',
          description: 'Busca produtos cadastrados no sistema. Retorna informações de produtos incluindo preços, estoque e categorias.',
          parameters: {
            type: 'object',
            properties: {
              filtro: {
                type: 'string',
                description: 'Filtro opcional para buscar produtos por nome, SKU ou descrição.',
              },
              limite: {
                type: 'number',
                description: 'Número máximo de produtos a retornar. Padrão: 20.',
              },
            },
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'buscar_clientes',
          description: 'Busca clientes cadastrados. Retorna lista de clientes com informações de contato.',
          parameters: {
            type: 'object',
            properties: {
              filtro: {
                type: 'string',
                description: 'Filtro opcional para buscar clientes por nome, email ou documento.',
              },
              limite: {
                type: 'number',
                description: 'Número máximo de clientes a retornar. Padrão: 20.',
              },
            },
          },
        },
      },
    ];
  }

  /**
   * Executa uma tool baseado no nome
   */
  async executeTool(toolName: string, args: any, userId: string, companyId: string) {
    this.logger.log(`🔧 Executando tool: ${toolName}`);
    this.logger.log(`📋 Argumentos:`, JSON.stringify(args, null, 2));
    
    switch (toolName) {
      case 'buscar_vendas':
        return await this.buscarVendas(
          userId,
          companyId,
          args.dataInicio,
          args.dataFim,
        );
      
      case 'buscar_estoque':
        return await this.buscarEstoque(
          userId,
          companyId,
          args.filtro,
        );
      
      case 'buscar_financeiro':
        return await this.buscarFinanceiro(
          userId,
          companyId,
          args.tipo || 'ambos',
        );
      
      case 'buscar_produtos':
        return await this.buscarProdutos(
          userId,
          companyId,
          args.filtro,
          args.limite || 20,
        );
      
      case 'buscar_clientes':
        return await this.buscarClientes(
          userId,
          companyId,
          args.filtro,
          args.limite || 20,
        );
        
      default:
        return { erro: `Tool ${toolName} não encontrada` };
    }
  }
}

