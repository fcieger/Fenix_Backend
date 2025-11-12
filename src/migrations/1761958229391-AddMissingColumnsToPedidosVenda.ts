import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingColumnsToPedidosVenda1761958229391 implements MigrationInterface {
    name = 'AddMissingColumnsToPedidosVenda1761958229391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'formas_pagamento_companyId_fkey' AND table_name = 'formas_pagamento') THEN
                    ALTER TABLE "formas_pagamento" DROP CONSTRAINT "formas_pagamento_companyId_fkey";
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_orcamentos_local_estoque' AND table_name = 'orcamentos') THEN
                    ALTER TABLE "orcamentos" DROP CONSTRAINT "FK_orcamentos_local_estoque";
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_orcamentos_forma_pagamento' AND table_name = 'orcamentos') THEN
                    ALTER TABLE "orcamentos" DROP CONSTRAINT "FK_orcamentos_forma_pagamento";
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_a51764ea79b35ffa1e8a9cc6f75' 
                    AND table_name = 'pedidos_venda'
                ) THEN
                    ALTER TABLE "pedidos_venda" DROP CONSTRAINT "FK_a51764ea79b35ffa1e8a9cc6f75";
                END IF;
            END $$;
        `);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_formas_pagamento_company_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_formas_pagamento_ativo"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_formas_pagamento_padrao"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_locais_company"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_orcamentos_forma_pagamento"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_orcamentos_local_estoque"`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "pedido_venda_itens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pedidoVendaId" uuid NOT NULL, "companyId" uuid NOT NULL, "produtoId" uuid, "naturezaOperacaoId" uuid NOT NULL, "codigo" character varying NOT NULL, "nome" character varying NOT NULL, "unidade" character varying NOT NULL, "ncm" character varying, "cest" character varying, "quantidade" numeric(14,6) NOT NULL, "precoUnitario" numeric(14,6) NOT NULL, "descontoValor" numeric(14,2) NOT NULL DEFAULT '0', "descontoPercentual" numeric(5,2) NOT NULL DEFAULT '0', "freteRateado" numeric(14,2) NOT NULL DEFAULT '0', "seguroRateado" numeric(14,2) NOT NULL DEFAULT '0', "outrasDespesasRateado" numeric(14,2) NOT NULL DEFAULT '0', "icmsBase" numeric(14,4), "icmsAliquota" numeric(7,4), "icmsValor" numeric(14,2), "icmsStBase" numeric(14,4), "icmsStAliquota" numeric(7,4), "icmsStValor" numeric(14,2), "ipiAliquota" numeric(7,4), "ipiValor" numeric(14,2), "pisAliquota" numeric(7,4), "pisValor" numeric(14,2), "cofinsAliquota" numeric(7,4), "cofinsValor" numeric(14,2), "totalItem" numeric(14,2) NOT NULL, "observacoes" text, "numeroItem" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3c2e05f2935f52fae2ceb41b0be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orcamentos" DROP COLUMN IF EXISTS "dataEntrega"`);
        await queryRunner.query(`ALTER TABLE "orcamentos" DROP COLUMN IF EXISTS "numeroOrdemCompra"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN IF EXISTS "dataPrevisao"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN IF EXISTS "naturezaOperacaoId"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN IF EXISTS "formaPagamento"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN IF EXISTS "estoque"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN IF EXISTS "totalPedido"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN IF EXISTS "numeroPedido"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN IF EXISTS "numeroNFe"`);
        await queryRunner.query(`ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "numeroPedidoCotacao" character varying`);
        await queryRunner.query(`ALTER TABLE "orcamentos" ADD COLUMN IF NOT EXISTS "dataValidade" date`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "numero" character varying`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "serie" character varying`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "orcamentoId" uuid`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "dataPrevisaoEntrega" date`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "naturezaOperacaoPadraoId" uuid`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "formaPagamentoId" uuid`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "localEstoqueId" uuid`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "totalGeral" numeric(14,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "observacoes" text`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" DROP COLUMN IF EXISTS "descricao"`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ADD COLUMN IF NOT EXISTS "descricao" character varying`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ALTER COLUMN "ativo" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ALTER COLUMN "padrao" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ALTER COLUMN "updated_at" SET NOT NULL`);
        // Atualizar registros existentes antes de tornar NOT NULL
        await queryRunner.query(`ALTER TABLE "locais_estoque" DROP COLUMN IF EXISTS "nome"`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" ADD "nome" character varying NULL`);
        await queryRunner.query(`UPDATE "locais_estoque" SET nome = 'Local ' || COALESCE(codigo, id::text) WHERE nome IS NULL`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" ALTER COLUMN "nome" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" DROP COLUMN "codigo"`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" ADD "codigo" character varying`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "numeroOrdemCompra" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "parcelamento" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "consumidorFinal" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "consumidorFinal" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "indicadorPresenca"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "indicadorPresenca" character varying`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "frete"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "frete" character varying`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "valorFrete" TYPE numeric(14,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "valorFrete" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "despesas" TYPE numeric(14,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "despesas" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "incluirFreteTotal" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "incluirFreteTotal" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "pesoLiquido" TYPE numeric(14,3)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "pesoLiquido" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "pesoBruto" TYPE numeric(14,3)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "pesoBruto" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "volume" TYPE numeric(14,3)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "volume" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "totalProdutos" TYPE numeric(14,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "totalDescontos" TYPE numeric(14,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "totalImpostos" TYPE numeric(14,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`DO $$ BEGIN CREATE TYPE "public"."pedidos_venda_status_enum" AS ENUM('rascunho', 'pendente', 'em_preparacao', 'enviado', 'entregue', 'cancelado', 'faturado'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD COLUMN IF NOT EXISTS "status" "public"."pedidos_venda_status_enum" NOT NULL DEFAULT 'rascunho'`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ADD CONSTRAINT "FK_63fad9c2c9fb052226b04b95b20" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" ADD CONSTRAINT "FK_834c2dcf9ba4adba9a722719eb9" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orcamentos" ADD CONSTRAINT "FK_16686a8b69415fe690ad0f2a7a0" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orcamentos" ADD CONSTRAINT "FK_ebed09a5da4ef95b20776c7d7bd" FOREIGN KEY ("localEstoqueId") REFERENCES "locais_estoque"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedido_venda_itens" ADD CONSTRAINT "FK_f6cf429031c0bb2ed5789ed6804" FOREIGN KEY ("pedidoVendaId") REFERENCES "pedidos_venda"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedido_venda_itens" ADD CONSTRAINT "FK_59f484747659f372208672a401c" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedido_venda_itens" ADD CONSTRAINT "FK_a5e5bb45909da1c061ecce0b910" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedido_venda_itens" ADD CONSTRAINT "FK_fcc15e1efe3e4e79b74c697e9f8" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "natureza_operacao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD CONSTRAINT "FK_7088628a2505d8901608abb3b2b" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD CONSTRAINT "FK_4e61c35bc4cd5e3de6604cf6e31" FOREIGN KEY ("naturezaOperacaoPadraoId") REFERENCES "natureza_operacao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD CONSTRAINT "FK_7b268b10e2820ae6446f709565b" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD CONSTRAINT "FK_1d9029f3bed626f32858a999771" FOREIGN KEY ("localEstoqueId") REFERENCES "locais_estoque"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP CONSTRAINT "FK_1d9029f3bed626f32858a999771"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP CONSTRAINT "FK_7b268b10e2820ae6446f709565b"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP CONSTRAINT "FK_4e61c35bc4cd5e3de6604cf6e31"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP CONSTRAINT "FK_7088628a2505d8901608abb3b2b"`);
        await queryRunner.query(`ALTER TABLE "pedido_venda_itens" DROP CONSTRAINT "FK_fcc15e1efe3e4e79b74c697e9f8"`);
        await queryRunner.query(`ALTER TABLE "pedido_venda_itens" DROP CONSTRAINT "FK_a5e5bb45909da1c061ecce0b910"`);
        await queryRunner.query(`ALTER TABLE "pedido_venda_itens" DROP CONSTRAINT "FK_59f484747659f372208672a401c"`);
        await queryRunner.query(`ALTER TABLE "pedido_venda_itens" DROP CONSTRAINT "FK_f6cf429031c0bb2ed5789ed6804"`);
        await queryRunner.query(`ALTER TABLE "orcamentos" DROP CONSTRAINT "FK_ebed09a5da4ef95b20776c7d7bd"`);
        await queryRunner.query(`ALTER TABLE "orcamentos" DROP CONSTRAINT "FK_16686a8b69415fe690ad0f2a7a0"`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" DROP CONSTRAINT "FK_834c2dcf9ba4adba9a722719eb9"`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" DROP CONSTRAINT "FK_63fad9c2c9fb052226b04b95b20"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."pedidos_venda_status_enum"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "status" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "totalImpostos" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "totalDescontos" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "totalProdutos" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "volume" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "volume" TYPE numeric(10,3)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "pesoBruto" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "pesoBruto" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "pesoLiquido" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "pesoLiquido" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "incluirFreteTotal" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "incluirFreteTotal" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "despesas" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "despesas" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "valorFrete" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "valorFrete" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "frete"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "frete" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "indicadorPresenca"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "indicadorPresenca" integer NOT NULL DEFAULT '2'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "consumidorFinal" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "consumidorFinal" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "parcelamento" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ALTER COLUMN "numeroOrdemCompra" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" DROP COLUMN "codigo"`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" ADD "codigo" text`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" DROP COLUMN "nome"`);
        await queryRunner.query(`ALTER TABLE "locais_estoque" ADD "nome" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ALTER COLUMN "padrao" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ALTER COLUMN "ativo" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" DROP COLUMN "descricao"`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ADD "descricao" text`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "observacoes"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "totalGeral"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "localEstoqueId"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "formaPagamentoId"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "naturezaOperacaoPadraoId"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "dataPrevisaoEntrega"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "orcamentoId"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "serie"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" DROP COLUMN "numero"`);
        await queryRunner.query(`ALTER TABLE "orcamentos" DROP COLUMN "dataValidade"`);
        await queryRunner.query(`ALTER TABLE "orcamentos" DROP COLUMN "numeroPedidoCotacao"`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "numeroNFe" character varying`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "numeroPedido" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "totalPedido" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "estoque" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "formaPagamento" integer NOT NULL DEFAULT '15'`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "naturezaOperacaoId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD "dataPrevisao" date`);
        await queryRunner.query(`ALTER TABLE "orcamentos" ADD "numeroOrdemCompra" character varying`);
        await queryRunner.query(`ALTER TABLE "orcamentos" ADD "dataEntrega" date`);
        await queryRunner.query(`DROP TABLE "pedido_venda_itens"`);
        await queryRunner.query(`CREATE INDEX "IDX_orcamentos_local_estoque" ON "orcamentos" ("localEstoqueId") `);
        await queryRunner.query(`CREATE INDEX "IDX_orcamentos_forma_pagamento" ON "orcamentos" ("formaPagamentoId") `);
        await queryRunner.query(`CREATE INDEX "idx_locais_company" ON "locais_estoque" ("companyId") `);
        await queryRunner.query(`CREATE INDEX "idx_formas_pagamento_padrao" ON "formas_pagamento" ("padrao") `);
        await queryRunner.query(`CREATE INDEX "idx_formas_pagamento_ativo" ON "formas_pagamento" ("ativo") `);
        await queryRunner.query(`CREATE INDEX "idx_formas_pagamento_company_id" ON "formas_pagamento" ("companyId") `);
        await queryRunner.query(`ALTER TABLE "pedidos_venda" ADD CONSTRAINT "FK_a51764ea79b35ffa1e8a9cc6f75" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "natureza_operacao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orcamentos" ADD CONSTRAINT "FK_orcamentos_forma_pagamento" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orcamentos" ADD CONSTRAINT "FK_orcamentos_local_estoque" FOREIGN KEY ("localEstoqueId") REFERENCES "locais_estoque"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "formas_pagamento" ADD CONSTRAINT "formas_pagamento_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
