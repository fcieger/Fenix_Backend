import { Client } from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Carregar DATABASE_URL do .env manualmente
function loadEnv() {
  try {
    const envFile = readFileSync(resolve(__dirname, '.env'), 'utf-8');
    const envVars: Record<string, string> = {};
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        envVars[key] = value;
      }
    });
    return envVars;
  } catch (error) {
    console.error('Erro ao ler .env, usando process.env');
    return process.env;
  }
}

const env = loadEnv();

async function verificarTabelas() {
  const databaseUrl = env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL não encontrado no .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔌 Conectando ao banco Neon...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    // Listar todas as tabelas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`📊 Total de tabelas encontradas: ${result.rows.length}\n`);
    
    if (result.rows.length > 0) {
      console.log('📋 Tabelas criadas:');
      result.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
      console.log('\n✅ Tabelas criadas com sucesso no Neon!');
    } else {
      console.log('⚠️  Nenhuma tabela encontrada. Verifique se a sincronização foi executada.');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verificarTabelas();

