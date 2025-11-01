import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrcamentosRelationships20250131140000 implements MigrationInterface {
  name = 'UpdateOrcamentosRelationships20250131140000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna antiga formaPagamento (string) e adicionar formaPagamentoId (UUID)
    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP COLUMN IF EXISTS "formaPagamento";
    `);
    
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ADD COLUMN IF NOT EXISTS "formaPagamentoId" uuid NULL;
    `);

    // Verificar se a constraint já existe antes de criar
    const constraintFormaExists = await queryRunner.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'orcamentos' 
      AND constraint_name = 'FK_orcamentos_forma_pagamento';
    `);

    if (constraintFormaExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE orcamentos
        ADD CONSTRAINT "FK_orcamentos_forma_pagamento"
        FOREIGN KEY ("formaPagamentoId")
        REFERENCES formas_pagamento(id)
        ON DELETE SET NULL;
      `);
    }

    // Remover coluna antiga estoque (string) e adicionar localEstoqueId (UUID)
    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP COLUMN IF EXISTS estoque;
    `);
    
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ADD COLUMN IF NOT EXISTS "localEstoqueId" uuid NULL;
    `);

    // Verificar se a constraint já existe antes de criar
    const constraintEstoqueExists = await queryRunner.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'orcamentos' 
      AND constraint_name = 'FK_orcamentos_local_estoque';
    `);

    if (constraintEstoqueExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE orcamentos
        ADD CONSTRAINT "FK_orcamentos_local_estoque"
        FOREIGN KEY ("localEstoqueId")
        REFERENCES locais_estoque(id)
        ON DELETE SET NULL;
      `);
    }

    // Criar índices para melhor performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orcamentos_forma_pagamento" ON orcamentos("formaPagamentoId");
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orcamentos_local_estoque" ON orcamentos("localEstoqueId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orcamentos_local_estoque";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orcamentos_forma_pagamento";`);

    // Remover foreign keys
    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP CONSTRAINT IF EXISTS "FK_orcamentos_local_estoque";
    `);

    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP CONSTRAINT IF EXISTS "FK_orcamentos_forma_pagamento";
    `);

    // Reverter colunas
    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP COLUMN IF EXISTS "localEstoqueId";
    `);

    await queryRunner.query(`
      ALTER TABLE orcamentos
      ADD COLUMN IF NOT EXISTS estoque varchar NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP COLUMN IF EXISTS "formaPagamentoId";
    `);

    await queryRunner.query(`
      ALTER TABLE orcamentos
      ADD COLUMN IF NOT EXISTS "formaPagamento" varchar NULL;
    `);
  }
}

