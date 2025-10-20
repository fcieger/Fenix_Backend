import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveIpiAplicarProduto1734021000001 implements MigrationInterface {
  name = 'RemoveIpiAplicarProduto1734021000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna existe antes de tentar removê-la
    const table = await queryRunner.getTable("configuracao_imposto_estado");
    if (table && table.findColumnByName("ipiAplicarProduto")) {
      await queryRunner.query(`ALTER TABLE "configuracao_imposto_estado" DROP COLUMN "ipiAplicarProduto"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna ipiAplicarProduto de volta (para rollback)
    await queryRunner.query(`ALTER TABLE "configuracao_imposto_estado" ADD "ipiAplicarProduto" boolean NOT NULL DEFAULT false`);
  }
}
