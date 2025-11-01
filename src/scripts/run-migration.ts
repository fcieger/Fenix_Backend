import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function runMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'fenix_user',
    password: process.env.DB_PASSWORD || 'fenix_password',
    database: process.env.DB_DATABASE || 'fenix_db',
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sql = `
        ALTER TABLE orcamentos
        ADD COLUMN IF NOT EXISTS parcelamento varchar NULL,
        ADD COLUMN IF NOT EXISTS "consumidorFinal" boolean NULL,
        ADD COLUMN IF NOT EXISTS "indicadorPresenca" varchar NULL,
        ADD COLUMN IF NOT EXISTS estoque varchar NULL,
        ADD COLUMN IF NOT EXISTS "listaPreco" varchar NULL,
        ADD COLUMN IF NOT EXISTS frete varchar NULL,
        ADD COLUMN IF NOT EXISTS "valorFrete" numeric(14,2) NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS despesas numeric(14,2) NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "incluirFreteTotal" boolean NULL,
        ADD COLUMN IF NOT EXISTS "placaVeiculo" varchar NULL,
        ADD COLUMN IF NOT EXISTS "ufPlaca" varchar NULL,
        ADD COLUMN IF NOT EXISTS rntc varchar NULL,
        ADD COLUMN IF NOT EXISTS "pesoLiquido" numeric(14,3) NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "pesoBruto" numeric(14,3) NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS volume numeric(14,3) NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS especie varchar NULL,
        ADD COLUMN IF NOT EXISTS marca varchar NULL,
        ADD COLUMN IF NOT EXISTS numeracao varchar NULL,
        ADD COLUMN IF NOT EXISTS "quantidadeVolumes" integer NULL;
      `;

      await queryRunner.query(sql);
      await queryRunner.commitTransaction();
      console.log('✅ Migration executada com sucesso!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  }
}

runMigration();


