import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { UpdateOrcamentosRelationships20250131140000 } from '../migrations/20250131140000-update-orcamentos-relationships';

config({ path: path.resolve(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'fenix_user',
  password: process.env.DB_PASSWORD || 'fenix_password',
  database: process.env.DB_DATABASE || 'fenix_db',
  entities: [], // No need for entities here, just running migration
  migrations: [],
  synchronize: false,
  logging: true,
});

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const migration = new UpdateOrcamentosRelationships20250131140000();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      await migration.up(queryRunner);
      await queryRunner.commitTransaction();
      console.log('✅ Migration executada com sucesso!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

runMigration();

