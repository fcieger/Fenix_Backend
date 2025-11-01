import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrcamentosStatusAndFields20250131150000 implements MigrationInterface {
  name = 'UpdateOrcamentosStatusAndFields20250131150000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Renomear numeroOrdemCompra para numeroPedidoCotacao
    await queryRunner.query(`
      ALTER TABLE orcamentos
      RENAME COLUMN "numeroOrdemCompra" TO "numeroPedidoCotacao";
    `);

    // 2. Remover coluna dataEntrega
    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP COLUMN IF EXISTS "dataEntrega";
    `);

    // 3. Adicionar coluna dataValidade
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ADD COLUMN IF NOT EXISTS "dataValidade" date NULL;
    `);

    // 4. Adicionar coluna motivoPerda
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ADD COLUMN IF NOT EXISTS "motivoPerda" text NULL;
    `);

    // 5. Atualizar enum StatusOrcamento
    // Primeiro, atualizar valores existentes (convertendo para varchar temporariamente)
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ALTER COLUMN status TYPE varchar
      USING status::varchar;
    `);

    await queryRunner.query(`
      UPDATE orcamentos
      SET status = 'rascunho'
      WHERE status = 'pendente';
    `);

    await queryRunner.query(`
      UPDATE orcamentos
      SET status = 'ganho'
      WHERE status = 'concluido';
    `);

    // Criar o novo tipo enum
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE status_orcamento_enum AS ENUM ('rascunho', 'enviado', 'perdido', 'ganho');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Remover DEFAULT antes de alterar o tipo
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ALTER COLUMN status DROP DEFAULT;
    `);

    // Aplicar o tipo enum
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ALTER COLUMN status TYPE status_orcamento_enum
      USING status::status_orcamento_enum;
    `);

    // Definir valor padrão
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ALTER COLUMN status SET DEFAULT 'rascunho';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter mudanças na ordem inversa

    // Reverter enum
    await queryRunner.query(`
      UPDATE orcamentos
      SET status = 'pendente'
      WHERE status = 'rascunho';
    `);

    await queryRunner.query(`
      UPDATE orcamentos
      SET status = 'concluido'
      WHERE status = 'ganho';
    `);

    await queryRunner.query(`
      ALTER TABLE orcamentos
      ALTER COLUMN status TYPE varchar
      USING status::varchar;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE status_orcamento_enum_old AS ENUM ('pendente', 'concluido');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE orcamentos
      ALTER COLUMN status TYPE status_orcamento_enum_old
      USING status::status_orcamento_enum_old;
    `);

    await queryRunner.query(`
      ALTER TABLE orcamentos
      ALTER COLUMN status SET DEFAULT 'pendente';
    `);

    // Remover coluna motivoPerda
    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP COLUMN IF EXISTS "motivoPerda";
    `);

    // Remover coluna dataValidade
    await queryRunner.query(`
      ALTER TABLE orcamentos
      DROP COLUMN IF EXISTS "dataValidade";
    `);

    // Adicionar coluna dataEntrega
    await queryRunner.query(`
      ALTER TABLE orcamentos
      ADD COLUMN IF NOT EXISTS "dataEntrega" date NULL;
    `);

    // Renomear numeroPedidoCotacao para numeroOrdemCompra
    await queryRunner.query(`
      ALTER TABLE orcamentos
      RENAME COLUMN "numeroPedidoCotacao" TO "numeroOrdemCompra";
    `);
  }
}

