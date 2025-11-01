import { Pool } from 'pg';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '../../.env') });

async function fixFormasPagamento() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'fenix_user',
    password: process.env.DB_PASSWORD || 'fenix_password',
    database: process.env.DB_DATABASE || 'fenix_db',
  });

  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao banco de dados');

    // Atualizar valores NULL para um valor padrão
    const result = await client.query(`
      UPDATE formas_pagamento 
      SET nome = 'Forma de Pagamento ' || id::text
      WHERE nome IS NULL;
    `);

    console.log(`✅ ${result.rowCount} registro(s) atualizado(s)`);

    // Verificar se ainda há valores NULL
    const checkResult = await client.query(`
      SELECT COUNT(*) as count FROM formas_pagamento WHERE nome IS NULL;
    `);

    if (parseInt(checkResult.rows[0].count) === 0) {
      console.log('✅ Todos os registros foram corrigidos');
    } else {
      console.log(`⚠️ Ainda há ${checkResult.rows[0].count} registro(s) com nome NULL`);
    }

    client.release();
    await pool.end();
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

fixFormasPagamento();


