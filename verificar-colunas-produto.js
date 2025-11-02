const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:fenix123@localhost:5432/fenix',
});

async function verificarColunas() {
  const client = await pool.connect();
  try {
    // Verificar colunas da tabela produtos
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'produtos' 
      AND column_name LIKE '%custo%' OR column_name LIKE '%preco%'
      ORDER BY column_name
    `);
    
    console.log('Colunas relacionadas a custo/preço na tabela produtos:');
    res.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
    // Verificar todas as colunas
    const allCols = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'produtos'
      ORDER BY column_name
    `);
    
    console.log('\nTodas as colunas da tabela produtos:');
    allCols.rows.forEach(row => {
      console.log(`  - ${row.column_name}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verificarColunas();
