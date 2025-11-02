const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix',
});

async function corrigirPedido() {
  const client = await pool.connect();
  try {
    const pedidoId = '46f53dbb-5305-49d0-9da8-60c1bedd92ef';
    
    console.log('=== CORRIGINDO PEDIDO ===\n');
    
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
    
    // Verificar se já tem movimentos
    const movRes = await client.query(
      'SELECT COUNT(*) as count FROM estoque_movimentos WHERE origem = $1 AND "origemId" = $2',
      ['pedido_venda', pedido.id]
    );
    
    if (Number(movRes.rows[0].count) > 0) {
      console.log('✅ Pedido já tem movimentos criados!');
      return;
    }
    
    // Buscar itens do pedido
    const itensRes = await client.query(
      'SELECT * FROM pedidos_venda_itens WHERE "pedidoVendaId" = $1',
      [pedido.id]
    );
    
    if (itensRes.rows.length === 0) {
      console.log('❌ Pedido não tem itens!');
      return;
    }
    
    if (!pedido.localEstoqueId) {
      console.log('❌ Pedido não tem local de estoque selecionado!');
      return;
    }
    
    console.log(`Criando ${itensRes.rows.length} movimento(s) de estoque...\n`);
    
    await client.query('BEGIN');
    
    for (const item of itensRes.rows) {
      if (!item.produtoId) {
        console.log(`⚠️ Item "${item.nome}" não tem produtoId, ignorando...`);
        continue;
      }
      
      const produtoId = item.produtoId;
      const qtd = Number(item.quantidade || 0);
      
      if (qtd <= 0) {
        console.log(`⚠️ Item "${item.nome}" tem quantidade inválida (${qtd}), ignorando...`);
        continue;
      }
      
      // Buscar preço de custo
      const produtoRes = await client.query(
        'SELECT "precoCusto" FROM produtos WHERE id = $1 AND "companyId" = $2',
        [produtoId, pedido.companyId]
      );
      
      const precoCusto = produtoRes.rows[0]?.precoCusto || 0;
      const custoTotal = Number(precoCusto) * qtd;
      
      // Criar movimento
      const movResult = await client.query(
        `INSERT INTO estoque_movimentos ("produtoId","localOrigemId","localDestinoId",tipo,qtd,"custoUnitario","custoTotal",origem,"origemId","dataMov","companyId")
         VALUES ($1,$2,$3,'saida',$4,$5,$6,'pedido_venda',$7, now(), $8)
         RETURNING id`,
        [produtoId, pedido.localEstoqueId, null, qtd, precoCusto, custoTotal, pedido.id, pedido.companyId]
      );
      
      console.log(`✅ Movimento criado para "${item.nome}" (ID: ${movResult.rows[0].id})`);
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Lançamento concluído! Os saldos foram atualizados automaticamente pelo trigger.');
    
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

corrigirPedido();
