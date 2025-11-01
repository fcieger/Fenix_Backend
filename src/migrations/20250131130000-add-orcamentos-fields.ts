import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrcamentosFields20250131130000 implements MigrationInterface {
  name = 'AddOrcamentosFields20250131130000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP COLUMN IF EXISTS parcelamento,
      DROP COLUMN IF EXISTS "consumidorFinal",
      DROP COLUMN IF EXISTS "indicadorPresenca",
      DROP COLUMN IF EXISTS estoque,
      DROP COLUMN IF EXISTS "listaPreco",
      DROP COLUMN IF EXISTS frete,
      DROP COLUMN IF EXISTS "valorFrete",
      DROP COLUMN IF EXISTS despesas,
      DROP COLUMN IF EXISTS "incluirFreteTotal",
      DROP COLUMN IF EXISTS "placaVeiculo",
      DROP COLUMN IF EXISTS "ufPlaca",
      DROP COLUMN IF EXISTS rntc,
      DROP COLUMN IF EXISTS "pesoLiquido",
      DROP COLUMN IF EXISTS "pesoBruto",
      DROP COLUMN IF EXISTS volume,
      DROP COLUMN IF EXISTS especie,
      DROP COLUMN IF EXISTS marca,
      DROP COLUMN IF EXISTS numeracao,
      DROP COLUMN IF EXISTS "quantidadeVolumes";
    `);
  }
}


