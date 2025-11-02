import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSimplesNacionalToCompany1761013200000 implements MigrationInterface {
    name = 'AddSimplesNacionalToCompany1761013200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'companies' AND column_name = 'simplesNacional'
                ) THEN
                    ALTER TABLE "companies" ADD "simplesNacional" boolean NOT NULL DEFAULT false;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "simplesNacional"`);
    }
}







