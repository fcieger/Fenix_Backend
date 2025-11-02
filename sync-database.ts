import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function syncDatabase() {
  console.log('🔄 Iniciando sincronização do banco de dados Neon...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  try {
    console.log('📊 Verificando conexão...');
    await dataSource.initialize();
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📋 Entidades carregadas:', dataSource.entityMetadatas.length);
    
    // Com autoLoadEntities e synchronize: true, as tabelas serão criadas automaticamente
    // ao iniciar a aplicação. Este script apenas verifica a conexão.
    console.log('✅ Configuração de sincronização ativada.');
    console.log('💡 Execute: SYNC_TABLES=true npm run start:dev para criar as tabelas');
    
    await dataSource.destroy();
    await app.close();
    
    console.log('✅ Script finalizado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error);
    await app.close();
    process.exit(1);
  }
}

syncDatabase();

