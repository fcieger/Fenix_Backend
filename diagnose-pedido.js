const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix',
});

async function diagnosePedido() {
  const client = await pool.connect();
  try {
    const pedidoId = '46f53dbb-5305-49d0-9da8-60c1bedd92ef';
    
    console.log('=== DIAGNÓSTICO DO PEDIDO ===\n');
    
    // Buscar pedido
    const pedidoRes = await client.query(
      'SELECT * FROM pedidos_venda WHERE id = $1',
      [pedidoId]
    );
    
    if (pedidoRes.rows.length === 0) {
      console.log('Pedido não encontrado!');
      return;
    }
    
    const pedido = pedidoRes.rows[0];
    console.log('📦 PEDIDO:');
    console.log('  ID:', pedido.id);
    console.log('  Número:', pedido.numero || 'N/A');
    console.log('  Status:', pedido.status);
    console.log('  Data Entrega:', pedido.dataEntrega);
    console.log('  Company ID:', pedido.companyId);
    console.log('  Natureza Operação ID:', pedido.naturezaOperacaoPadraoId || 'NÃO DEFINIDA');
    console.log('  Local Estoque ID:', pedido.localEstoqueId || 'NÃO DEFINIDO');
    
    // Verificar movimentos já criados
    const movRes = await client.query(
      'SELECT * FROM estoque_movimentos WHERE origem = $1 AND "origemId" = $2',
      ['pedido_venda', pedido.id]
    );
    console.log('\n📊 MOVIMENTOS DE ESTOQUE:', movRes.rows.length);
    if (movRes.rows.length > 0) {
      movRes.rows.forEach((mov, idx) => {
        console.log(`  ${idx + 1}. Produto: ${mov.produtoId}, Qtd: ${mov.qtd}, Tipo: ${mov.tipo}`);
      });
    }
    
    // Buscar itens do pedido
    const itensRes = await client.query(
      'SELECT * FROM pedidos_venda_itens WHERE "pedidoVendaId" = $1',
      [pedido.id]
    );
    console.log('\n📋 ITENS DO PEDIDO:', itensRes.rows.length);
    itensRes.rows.forEach((item, idx) => {
      console.log(`  ${idx + 1}. Produto ID: ${item.produtoId || 'NÃO DEFINIDO'}, Qtd: ${item.quantidade || 0}, Nome: ${item.nome || 'N/A'}`);
    });
    
    // Buscar natureza de operação
    if (pedido.naturezaOperacaoPadraoId) {
      const naturezaRes = await client.query(
        'SELECT * FROM natureza_operacao WHERE id = $1',
        [pedido.naturezaOperacaoPadraoId]
      );
      if (naturezaRes.rows.length > 0) {
        const natureza = naturezaRes.rows[0];
        console.log('\n⚙️ NATUREZA DE OPERAÇÃO:');
        console.log('  Nome:', natureza.nome);
        console.log('  Movimenta Estoque:', natureza.movimentaEstoque ? 'SIM ✅' : 'NÃO ❌');
      } else {
        console.log('\n⚠️ NATUREZA DE OPERAÇÃO: NÃO ENCONTRADA');
      }
    } else {
      console.log('\n⚠️ NATUREZA DE OPERAÇÃO: NÃO SELECIONADA');
    }
    
    // Diagnóstico
    console.log('\n🔍 DIAGNÓSTICO:');
    const problemas = [];
    
    if (!pedido.naturezaOperacaoPadraoId) {
      problemas.push('❌ Natureza de operação não selecionada');
    } else {
      const naturezaRes = await client.query('SELECT "movimentaEstoque" FROM natureza_operacao WHERE id = $1', [pedido.naturezaOperacaoPadraoId]);
      if (naturezaRes.rows.length === 0) {
        problemas.push('❌ Natureza de operação não encontrada no banco');
      } else if (!naturezaRes.rows[0].movimentaEstoque) {
        problemas.push('❌ Natureza de operação não movimenta estoque');
      }
    }
    
    if (!pedido.localEstoqueId) {
      problemas.push('❌ Local de estoque não selecionado');
    }
    
    const itensComProduto = itensRes.rows.filter(item => item.produtoId);
    if (itensComProduto.length === 0) {
      problemas.push('❌ Nenhum item com produto ID definido');
    }
    
    if (movRes.rows.length > 0) {
      problemas.push('✅ Movimentos já foram lançados anteriormente');
    }
    
    if (problemas.length === 0) {
      console.log('✅ Todos os requisitos estão atendidos');
      console.log('\n💡 SOLUÇÃO:');
      console.log('   O lançamento deveria ter sido feito. Verifique os logs do console para ver o que aconteceu.');
    } else {
      problemas.forEach(p => console.log('  ', p));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

diagnosePedido();
