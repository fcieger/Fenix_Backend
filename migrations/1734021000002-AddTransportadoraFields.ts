import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransportadoraFields1734021000002 implements MigrationInterface {
  name = 'AddTransportadoraFields1734021000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se as colunas já existem antes de adicioná-las
    const table = await queryRunner.getTable("pedidos_venda");
    
    // Adicionar campos da transportadora na tabela pedidos_venda (apenas se não existirem)
    if (!table?.findColumnByName("transportadora_id")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "transportadora_id" UUID`);
    }
    
    if (!table?.findColumnByName("placa_veiculo")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "placa_veiculo" VARCHAR(10)`);
    }
    
    if (!table?.findColumnByName("uf_placa")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "uf_placa" VARCHAR(2)`);
    }
    
    if (!table?.findColumnByName("rntc")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "rntc" VARCHAR(20)`);
    }
    
    if (!table?.findColumnByName("peso_liquido")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "peso_liquido" DECIMAL(10,2)`);
    }
    
    if (!table?.findColumnByName("peso_bruto")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "peso_bruto" DECIMAL(10,2)`);
    }
    
    if (!table?.findColumnByName("volume")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "volume" DECIMAL(10,3)`);
    }
    
    if (!table?.findColumnByName("quantidade_volumes")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "quantidade_volumes" INTEGER`);
    }
    
    if (!table?.findColumnByName("especie")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "especie" VARCHAR(50)`);
    }
    
    if (!table?.findColumnByName("marca")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "marca" VARCHAR(50)`);
    }
    
    if (!table?.findColumnByName("numeracao")) {
      await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN "numeracao" VARCHAR(100)`);
    }

    // Adicionar foreign key para transportadora_id
    await queryRunner.query(`
      ALTER TABLE "pedidos_venda" 
      ADD CONSTRAINT "FK_pedidos_venda_transportadora" 
      FOREIGN KEY ("transportadora_id") 
      REFERENCES "cadastros"("id") 
      ON DELETE SET NULL
    `);

    // Adicionar índices para melhor performance
    await queryRunner.query(`
      CREATE INDEX "IDX_pedidos_venda_transportadora_id" 
      ON "pedidos_venda" ("transportadora_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "pedidos_venda" 
      DROP CONSTRAINT "FK_pedidos_venda_transportadora"
    `);

    // Remover índice
    await queryRunner.query(`
      DROP INDEX "IDX_pedidos_venda_transportadora_id"
    `);

    // Remover colunas
    await queryRunner.query(`
      ALTER TABLE "pedidos_venda" 
      DROP COLUMN "transportadora_id",
      DROP COLUMN "placa_veiculo",
      DROP COLUMN "uf_placa",
      DROP COLUMN "rntc",
      DROP COLUMN "peso_liquido",
      DROP COLUMN "peso_bruto",
      DROP COLUMN "volume",
      DROP COLUMN "quantidade_volumes",
      DROP COLUMN "especie",
      DROP COLUMN "marca",
      DROP COLUMN "numeracao"
    `);
  }
}
