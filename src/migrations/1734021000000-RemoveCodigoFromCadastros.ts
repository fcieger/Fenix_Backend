import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCodigoFromCadastros1734021000000
  implements MigrationInterface
{
  name = 'RemoveCodigoFromCadastros1734021000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar se a coluna existe antes de tentar removê-la
    const table = await queryRunner.getTable('cadastros');
    if (table && table.findColumnByName('codigo')) {
      await queryRunner.query(`ALTER TABLE "cadastros" DROP COLUMN "codigo"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cadastros" ADD "codigo" character varying NOT NULL`,
    );
  }
}
