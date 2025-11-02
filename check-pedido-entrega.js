const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix',
});

async function checkPedido() {
  const client = await pool.connect();
  try {
    const pedidoId = '46f53dbb-0000-0000-0000-000000000000';
    
    // Verificar se o UUID está correto (pode ser que precise ajustar)
    console.log('Verificando pedido:', pedidoId);
    
    // Buscar pedido
    const pedidoRes = await client.query(
      'SELECT * FROM pedidos_venda WHERE id::text LIKE $1',
      [`%${pedidoId}%`]
    );
    
    if (pedidoRes.rows.length === 0) {
      // Tentar buscar pelo ID completo
      const pedidoRes2 = await client.query(
        'SELECT id, numero, status, "dataEntrega", "naturezaOperacaoPadraoId", "localEstoqueId", "companyId" FROM pedidos_venda WHERE id::text = $1',
        [pedidoId]
      );
      console.log('Pedidos encontrados (busca exata):', pedidoRes2.rows);
      
      // Buscar todos os pedidos recentes
      const recentRes = await client.query(
        'SELECT id, numero, status, "dataEntrega" FROM pedidos_venda ORDER BY "createdAt" DESC LIMIT 10'
      );
      console.log('Últimos 10 pedidos:', recentRes.rows.map(p => ({
        id: p.id,
        numero: p.numero,
        status: p.status,
        dataEntrega: p.dataEntrega
      })));
      
      return;
    }
    
    const pedido = pedidoRes.rows[0];
    console.log('Pedido encontrado:', {
      id: pedido.id,
      numero: pedido.numero,
      status: pedido.status,
      dataEntrega: pedido.dataEntrega,
      naturezaOperacaoPadraoId: pedido.naturezaOperacaoPadraoId,
      localEstoqueId: pedido.localEstoqueId,
      companyId: pedido.companyId
    });
    
    // Verificar movimentos já criados
    const movRes = await client.query(
      'SELECT * FROM estoque_movimentos WHERE origem = $1 AND "origemId" = $2',
      ['pedido_venda', pedido.id]
    );
    console.log('Movimentos encontrados:', movRes.rows.length);
    
    // Buscar itens do pedido
    const itensRes = await client.query(
      'SELECT * FROM pedidos_venda_itens WHERE "pedidoVendaId" = $1',
      [pedido.id]
    );
    console.log('Itens do pedido:', itensRes.rows.length);
    
    // Buscar natureza de operação
    if (pedido.naturezaOperacaoPadraoId) {
      const naturezaRes = await client.query(
        'SELECT * FROM natureza_operacao WHERE id = $1',
        [pedido.naturezaOperacaoPadraoId]
      );
      console.log('Natureza de operação:', naturezaRes.rows[0]);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkPedido();
