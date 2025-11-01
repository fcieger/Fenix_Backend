import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNumeroColumnsPedidosVenda20251031200000 implements MigrationInterface {
  name = 'AddNumeroColumnsPedidosVenda20251031200000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar colunas faltantes apenas se não existirem
    await queryRunner.query(`
      ALTER TABLE pedidos_venda
        ADD COLUMN IF NOT EXISTS numero varchar NULL,
        ADD COLUMN IF NOT EXISTS serie varchar NULL,
        ADD COLUMN IF NOT EXISTS "numeroOrdemCompra" varchar NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE pedidos_venda DROP COLUMN IF EXISTS "numeroOrdemCompra";`);
    await queryRunner.query(`ALTER TABLE pedidos_venda DROP COLUMN IF EXISTS serie;`);
    await queryRunner.query(`ALTER TABLE pedidos_venda DROP COLUMN IF EXISTS numero;`);
  }
}

