import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrcamentos20251031120000 implements MigrationInterface {
  name = 'CreateOrcamentos20251031120000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orcamentos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        numero varchar NULL,
        serie varchar NULL,
        "numeroOrdemCompra" varchar NULL,
        "dataEmissao" date NOT NULL,
        "dataPrevisaoEntrega" date NULL,
        "dataEntrega" date NULL,
        "clienteId" uuid NOT NULL,
        "vendedorId" uuid NULL,
        "transportadoraId" uuid NULL,
        "prazoPagamentoId" uuid NULL,
        "naturezaOperacaoPadraoId" uuid NULL,
        "formaPagamento" varchar NULL,
        "totalProdutos" numeric(14,2) NOT NULL DEFAULT 0,
        "totalDescontos" numeric(14,2) NOT NULL DEFAULT 0,
        "totalImpostos" numeric(14,2) NOT NULL DEFAULT 0,
        "totalGeral" numeric(14,2) NOT NULL DEFAULT 0,
        observacoes text NULL,
        status varchar NOT NULL DEFAULT 'pendente',
        "companyId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orcamento_itens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "orcamentoId" uuid NOT NULL,
        "companyId" uuid NOT NULL,
        "produtoId" uuid NULL,
        "naturezaOperacaoId" uuid NOT NULL,
        codigo varchar NOT NULL,
        nome varchar NOT NULL,
        unidade varchar NOT NULL,
        ncm varchar NULL,
        cest varchar NULL,
        quantidade numeric(14,6) NOT NULL,
        "precoUnitario" numeric(14,6) NOT NULL,
        "descontoValor" numeric(14,2) NOT NULL DEFAULT 0,
        "descontoPercentual" numeric(5,2) NOT NULL DEFAULT 0,
        "freteRateado" numeric(14,2) NOT NULL DEFAULT 0,
        "seguroRateado" numeric(14,2) NOT NULL DEFAULT 0,
        "outrasDespesasRateado" numeric(14,2) NOT NULL DEFAULT 0,
        "icmsBase" numeric(14,4) NULL,
        "icmsAliquota" numeric(7,4) NULL,
        "icmsValor" numeric(14,2) NULL,
        "icmsStBase" numeric(14,4) NULL,
        "icmsStAliquota" numeric(7,4) NULL,
        "icmsStValor" numeric(14,2) NULL,
        "ipiAliquota" numeric(7,4) NULL,
        "ipiValor" numeric(14,2) NULL,
        "pisAliquota" numeric(7,4) NULL,
        "pisValor" numeric(14,2) NULL,
        "cofinsAliquota" numeric(7,4) NULL,
        "cofinsValor" numeric(14,2) NULL,
        "totalItem" numeric(14,2) NOT NULL,
        observacoes text NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orc_company ON orcamentos("companyId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orc_cliente ON orcamentos("clienteId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orc_status ON orcamentos(status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orc_data ON orcamentos("dataEmissao");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_orci_orc ON orcamento_itens("orcamentoId");`);

    await queryRunner.query(`
      ALTER TABLE orcamentos
        ADD CONSTRAINT fk_orc_company FOREIGN KEY ("companyId") REFERENCES companies(id),
        ADD CONSTRAINT fk_orc_cliente FOREIGN KEY ("clienteId") REFERENCES cadastros(id),
        ADD CONSTRAINT fk_orc_vendedor FOREIGN KEY ("vendedorId") REFERENCES cadastros(id),
        ADD CONSTRAINT fk_orc_transportadora FOREIGN KEY ("transportadoraId") REFERENCES cadastros(id),
        ADD CONSTRAINT fk_orc_prazo FOREIGN KEY ("prazoPagamentoId") REFERENCES prazos_pagamento(id),
        ADD CONSTRAINT fk_orc_natop_padrao FOREIGN KEY ("naturezaOperacaoPadraoId") REFERENCES natureza_operacao(id);
    `);

    await queryRunner.query(`
      ALTER TABLE orcamento_itens
        ADD CONSTRAINT fk_orci_orc FOREIGN KEY ("orcamentoId") REFERENCES orcamentos(id) ON DELETE CASCADE,
        ADD CONSTRAINT fk_orci_company FOREIGN KEY ("companyId") REFERENCES companies(id),
        ADD CONSTRAINT fk_orci_prod FOREIGN KEY ("produtoId") REFERENCES produtos(id),
        ADD CONSTRAINT fk_orci_natop FOREIGN KEY ("naturezaOperacaoId") REFERENCES natureza_operacao(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS orcamento_itens;`);
    await queryRunner.query(`DROP TABLE IF EXISTS orcamentos;`);
  }
}



