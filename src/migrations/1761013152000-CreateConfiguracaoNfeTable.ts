import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateConfiguracaoNfeTable1761013152000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela configuracao_nfe
    await queryRunner.createTable(
      new Table({
        name: 'configuracao_nfe',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          // Campos Básicos
          {
            name: 'descricao_modelo',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'tipo_modelo',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'modelo',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'serie',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'numero_atual',
            type: 'integer',
            default: 0,
          },
          {
            name: 'ambiente',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'ativo',
            type: 'boolean',
            default: true,
          },
          // Campos RPS
          {
            name: 'rps_natureza_operacao',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rps_regime_tributario',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rps_regime_especial_tributacao',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rps_numero_lote_atual',
            type: 'integer',
            default: 0,
          },
          {
            name: 'rps_serie_lote_atual',
            type: 'integer',
            default: 0,
          },
          {
            name: 'rps_login_prefeitura',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rps_senha_prefeitura',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'rps_aliquota_iss',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'rps_enviar_notificacao_cliente',
            type: 'boolean',
            default: false,
          },
          {
            name: 'rps_receber_notificacao',
            type: 'boolean',
            default: false,
          },
          {
            name: 'rps_email_notificacao',
            type: 'varchar',
            isNullable: true,
          },
          // Campos NFC-e
          {
            name: 'nfce_id_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'nfce_csc_token',
            type: 'varchar',
            isNullable: true,
          },
          // Metadados
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Criar Foreign Key para companies (se não existir)
    const foreignKeyExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'FK_2e1e2482305d5b72df55b21a1b2' 
      AND table_name = 'configuracao_nfe'
    `);

    if (!foreignKeyExists.length) {
      await queryRunner.createForeignKey(
        'configuracao_nfe',
        new TableForeignKey({
          columnNames: ['company_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'companies',
          onDelete: 'CASCADE',
        }),
      );
    }

    // Criar índice único composto (company_id, modelo, serie)
    await queryRunner.createIndex(
      'configuracao_nfe',
      new TableIndex({
        name: 'IDX_configuracao_nfe_company_modelo_serie',
        columnNames: ['company_id', 'modelo', 'serie'],
        isUnique: true,
      }),
    );

    // Criar índice para busca por company_id e ativo
    await queryRunner.createIndex(
      'configuracao_nfe',
      new TableIndex({
        name: 'IDX_configuracao_nfe_company_ativo',
        columnNames: ['company_id', 'ativo'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.dropIndex(
      'configuracao_nfe',
      'IDX_configuracao_nfe_company_ativo',
    );
    await queryRunner.dropIndex(
      'configuracao_nfe',
      'IDX_configuracao_nfe_company_modelo_serie',
    );

    // Remover tabela (foreign keys são removidas automaticamente)
    await queryRunner.dropTable('configuracao_nfe');
  }
}
