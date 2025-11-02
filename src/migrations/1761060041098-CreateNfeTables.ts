import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNfeTables1761060041098 implements MigrationInterface {
    name = 'CreateNfeTables1761060041098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "nfe_itens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nfeId" uuid NOT NULL, "produtoId" uuid, "numeroItem" integer NOT NULL, "codigo" character varying(20) NOT NULL, "descricao" character varying(120) NOT NULL, "ncm" character varying(8), "cest" character varying(7), "cfop" character varying(4) NOT NULL, "unidadeComercial" character varying(6) NOT NULL, "unidadeTributavel" character varying(6) NOT NULL, "quantidade" numeric(15,4) NOT NULL, "quantidadeTributavel" numeric(15,4) NOT NULL, "valorUnitario" numeric(15,4) NOT NULL, "valorUnitarioTributavel" numeric(15,4) NOT NULL, "valorTotal" numeric(15,2) NOT NULL, "valorDesconto" numeric(15,2) NOT NULL DEFAULT '0', "valorFrete" numeric(15,2) NOT NULL DEFAULT '0', "valorSeguro" numeric(15,2) NOT NULL DEFAULT '0', "outrasDespesas" numeric(15,2) NOT NULL DEFAULT '0', "impostoICMS" jsonb, "impostoIPI" jsonb, "impostoPIS" jsonb, "impostoCOFINS" jsonb, "observacoes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd9285958f4c498afc3b2e67598" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "nfe_duplicatas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nfeId" uuid NOT NULL, "numero" character varying(15) NOT NULL, "dataVencimento" date NOT NULL, "valor" numeric(15,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bc9132596f2bc08139c338861b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_status_enum" AS ENUM('RASCUNHO', 'PENDENTE', 'AUTORIZADA', 'CANCELADA', 'REJEITADA'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_ambiente_enum" AS ENUM('PRODUCAO', 'HOMOLOGACAO'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_tipooperacao_enum" AS ENUM('ENTRADA', 'SAIDA'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_finalidade_enum" AS ENUM('NORMAL', 'COMPLEMENTAR', 'AJUSTE', 'DEVOLUCAO'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_indicadorpresenca_enum" AS ENUM('NAO_SE_APLICA', 'PRESENCIAL', 'INTERNET', 'TELEATENDIMENTO', 'NFCe_ENTREGA_DOMICILIO', 'NFCe_PRESENCIAL_FORA_ESTABELECIMENTO', 'OUTROS'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_destinatarioindicadorie_enum" AS ENUM('CONTRIBUINTE_ICMS', 'CONTRIBUINTE_ISENTO', 'NAO_CONTRIBUINTE'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_modalidadefrete_enum" AS ENUM('SEM_FRETE', 'POR_CONTA_EMITENTE', 'POR_CONTA_DESTINATARIO', 'POR_CONTA_TERCEIROS'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_formapagamento_enum" AS ENUM('VISTA', 'PRAZO'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."nfe_meiopagamento_enum" AS ENUM('DINHEIRO', 'CHEQUE', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'CARTAO_LOJA', 'VALE_ALIMENTACAO', 'VALE_REFEICAO', 'VALE_PRESENTE', 'VALE_COMBUSTIVEL', 'OUTROS', 'SEM_PAGAMENTO', 'TRANSFERENCIA_BANCARIA', 'BOLETO_BANCARIO', 'PIX'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "nfe" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "numeroNfe" character varying(9) NOT NULL, "serie" character varying(3) NOT NULL, "modelo" character varying(2) NOT NULL, "configuracaoNfeId" uuid NOT NULL, "chaveAcesso" character varying(44), "status" "public"."nfe_status_enum" NOT NULL DEFAULT 'RASCUNHO', "ambiente" "public"."nfe_ambiente_enum" NOT NULL, "tipoOperacao" "public"."nfe_tipooperacao_enum" NOT NULL, "finalidade" "public"."nfe_finalidade_enum" NOT NULL, "naturezaOperacaoId" uuid NOT NULL, "consumidorFinal" boolean NOT NULL, "indicadorPresenca" "public"."nfe_indicadorpresenca_enum" NOT NULL, "destinatarioId" uuid, "destinatarioTipo" character varying(1) NOT NULL, "destinatarioCnpjCpf" character varying(14) NOT NULL, "destinatarioRazaoSocial" character varying(60) NOT NULL, "destinatarioNomeFantasia" character varying(60), "destinatarioIE" character varying(14), "destinatarioIM" character varying(15), "destinatarioIndicadorIE" "public"."nfe_destinatarioindicadorie_enum", "destinatarioLogradouro" character varying(60) NOT NULL, "destinatarioNumero" character varying(10) NOT NULL, "destinatarioComplemento" character varying(60), "destinatarioBairro" character varying(60) NOT NULL, "destinatarioMunicipio" character varying(60) NOT NULL, "destinatarioUF" character varying(2) NOT NULL, "destinatarioCEP" character varying(8) NOT NULL, "destinatarioCodigoMunicipio" character varying(7), "destinatarioPais" character varying(60) NOT NULL DEFAULT 'Brasil', "destinatarioCodigoPais" character varying(4) NOT NULL DEFAULT '1058', "destinatarioTelefone" character varying(20), "destinatarioEmail" character varying(60), "dataEmissao" TIMESTAMP NOT NULL, "dataSaida" TIMESTAMP, "horaSaida" TIME, "dataAutorizacao" TIMESTAMP, "valorTotalProdutos" numeric(15,2) NOT NULL DEFAULT '0', "baseCalculoICMS" numeric(15,2) NOT NULL DEFAULT '0', "valorICMS" numeric(15,2) NOT NULL DEFAULT '0', "baseCalculoICMSST" numeric(15,2) NOT NULL DEFAULT '0', "valorICMSST" numeric(15,2) NOT NULL DEFAULT '0', "valorFrete" numeric(15,2) NOT NULL DEFAULT '0', "valorSeguro" numeric(15,2) NOT NULL DEFAULT '0', "valorDesconto" numeric(15,2) NOT NULL DEFAULT '0', "outrasDespesas" numeric(15,2) NOT NULL DEFAULT '0', "valorIPI" numeric(15,2) NOT NULL DEFAULT '0', "valorPIS" numeric(15,2) NOT NULL DEFAULT '0', "valorCOFINS" numeric(15,2) NOT NULL DEFAULT '0', "tributosAproximados" numeric(15,2) NOT NULL DEFAULT '0', "valorTotalNota" numeric(15,2) NOT NULL DEFAULT '0', "modalidadeFrete" "public"."nfe_modalidadefrete_enum", "incluirFreteTotal" boolean NOT NULL DEFAULT false, "transportadoraId" uuid, "transportadoraNome" character varying(60), "transportadoraCnpj" character varying(14), "transportadoraIE" character varying(14), "veiculoPlaca" character varying(7), "veiculoUF" character varying(2), "volumes" jsonb, "formaPagamento" "public"."nfe_formapagamento_enum", "meioPagamento" "public"."nfe_meiopagamento_enum", "informacoesComplementares" text, "informacoesFisco" text, "numeroPedido" character varying(15), "xmlNfe" text, "xmlRetorno" text, "protocoloAutorizacao" character varying(15), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_99e9ba64996c7e055175f3615ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_8a2cb8709d2da14e27da65c3bbd' 
                    AND table_name = 'nfe_itens'
                ) THEN
                    ALTER TABLE "nfe_itens" ADD CONSTRAINT "FK_8a2cb8709d2da14e27da65c3bbd" FOREIGN KEY ("nfeId") REFERENCES "nfe"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_e74438125815ccb254639fef16c' 
                    AND table_name = 'nfe_duplicatas'
                ) THEN
                    ALTER TABLE "nfe_duplicatas" ADD CONSTRAINT "FK_e74438125815ccb254639fef16c" FOREIGN KEY ("nfeId") REFERENCES "nfe"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "nfe_duplicatas" DROP CONSTRAINT "FK_e74438125815ccb254639fef16c"`);
        await queryRunner.query(`ALTER TABLE "nfe_itens" DROP CONSTRAINT "FK_8a2cb8709d2da14e27da65c3bbd"`);
        await queryRunner.query(`DROP TABLE "nfe"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_meiopagamento_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_formapagamento_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_modalidadefrete_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_destinatarioindicadorie_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_indicadorpresenca_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_finalidade_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_tipooperacao_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_ambiente_enum"`);
        await queryRunner.query(`DROP TYPE "public"."nfe_status_enum"`);
        await queryRunner.query(`DROP TABLE "nfe_duplicatas"`);
        await queryRunner.query(`DROP TABLE "nfe_itens"`);
    }

}
