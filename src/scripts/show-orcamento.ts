import { Pool } from 'pg';
import { config } from 'dotenv';

config();

async function showOrcamento() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'fenix_user',
    password: process.env.DB_PASSWORD || 'fenix_password',
    database: process.env.DB_DATABASE || 'fenix_db',
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados\n');

    // Buscar primeiro orçamento
    const orcamentoResult = await client.query(`
      SELECT * FROM orcamentos 
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `);

    if (orcamentoResult.rows.length === 0) {
      console.log('❌ Nenhum orçamento encontrado no banco de dados');
      client.release();
      await pool.end();
      return;
    }

    const orcamento = orcamentoResult.rows[0];

    console.log('='.repeat(80));
    console.log('📋 ORÇAMENTO ENCONTRADO');
    console.log('='.repeat(80));
    console.log('\n🔷 INFORMAÇÕES GERAIS:');
    console.log(JSON.stringify({
      id: orcamento.id,
      numero: orcamento.numero,
      serie: orcamento.serie,
      numeroOrdemCompra: orcamento.numeroOrdemCompra,
      status: orcamento.status,
      companyId: orcamento.companyId,
      dataEmissao: orcamento.dataEmissao,
      dataPrevisaoEntrega: orcamento.dataPrevisaoEntrega,
      dataEntrega: orcamento.dataEntrega,
      createdAt: orcamento.createdAt,
      updatedAt: orcamento.updatedAt,
    }, null, 2));

    console.log('\n🔷 RELACIONAMENTOS:');
    console.log(JSON.stringify({
      clienteId: orcamento.clienteId,
      vendedorId: orcamento.vendedorId,
      transportadoraId: orcamento.transportadoraId,
      prazoPagamentoId: orcamento.prazoPagamentoId,
      naturezaOperacaoPadraoId: orcamento.naturezaOperacaoPadraoId,
    }, null, 2));

    console.log('\n🔷 CAMPOS DE PAGAMENTO E CONFIGURAÇÕES:');
    console.log(JSON.stringify({
      formaPagamento: orcamento.formaPagamento,
      parcelamento: orcamento.parcelamento,
      consumidorFinal: orcamento.consumidorFinal,
      indicadorPresenca: orcamento.indicadorPresenca,
      estoque: orcamento.estoque,
      listaPreco: orcamento.listaPreco,
    }, null, 2));

    console.log('\n🔷 FRETE E DESPESAS:');
    console.log(JSON.stringify({
      frete: orcamento.frete,
      valorFrete: orcamento.valorFrete,
      despesas: orcamento.despesas,
      incluirFreteTotal: orcamento.incluirFreteTotal,
    }, null, 2));

    console.log('\n🔷 DADOS DO VEÍCULO:');
    console.log(JSON.stringify({
      placaVeiculo: orcamento.placaVeiculo,
      ufPlaca: orcamento.ufPlaca,
      rntc: orcamento.rntc,
    }, null, 2));

    console.log('\n🔷 DADOS DE VOLUME E PESO:');
    console.log(JSON.stringify({
      pesoLiquido: orcamento.pesoLiquido,
      pesoBruto: orcamento.pesoBruto,
      volume: orcamento.volume,
      especie: orcamento.especie,
      marca: orcamento.marca,
      numeracao: orcamento.numeracao,
      quantidadeVolumes: orcamento.quantidadeVolumes,
    }, null, 2));

    console.log('\n🔷 TOTAIS:');
    console.log(JSON.stringify({
      totalProdutos: orcamento.totalProdutos,
      totalDescontos: orcamento.totalDescontos,
      totalImpostos: orcamento.totalImpostos,
      totalGeral: orcamento.totalGeral,
    }, null, 2));

    console.log('\n🔷 OBSERVAÇÕES:');
    console.log(JSON.stringify({
      observacoes: orcamento.observacoes,
    }, null, 2));

    // Buscar itens
    const itensResult = await client.query(`
      SELECT * FROM orcamento_itens 
      WHERE "orcamentoId" = $1
      ORDER BY id
    `, [orcamento.id]);

    console.log('\n🔷 ITENS DO ORÇAMENTO:');
    if (itensResult.rows.length > 0) {
      itensResult.rows.forEach((item, index) => {
        console.log(`\n  Item ${index + 1}:`);
        console.log(JSON.stringify({
          id: item.id,
          produtoId: item.produtoId,
          naturezaOperacaoId: item.naturezaOperacaoId,
          codigo: item.codigo,
          nome: item.nome,
          unidade: item.unidade,
          ncm: item.ncm,
          cest: item.cest,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          descontoValor: item.descontoValor,
          descontoPercentual: item.descontoPercentual,
          freteRateado: item.freteRateado,
          seguroRateado: item.seguroRateado,
          outrasDespesasRateado: item.outrasDespesasRateado,
          icmsBase: item.icmsBase,
          icmsAliquota: item.icmsAliquota,
          icmsValor: item.icmsValor,
          icmsStBase: item.icmsStBase,
          icmsStAliquota: item.icmsStAliquota,
          icmsStValor: item.icmsStValor,
          ipiAliquota: item.ipiAliquota,
          ipiValor: item.ipiValor,
          pisAliquota: item.pisAliquota,
          pisValor: item.pisValor,
          cofinsAliquota: item.cofinsAliquota,
          cofinsValor: item.cofinsValor,
          totalItem: item.totalItem,
          observacoes: item.observacoes,
        }, null, 2));
      });
    } else {
      console.log('  Nenhum item encontrado');
    }

    console.log('\n' + '='.repeat(80));

    client.release();
    await pool.end();
  } catch (error: any) {
    console.error('❌ Erro ao consultar orçamento:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

showOrcamento();
