import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePedidosVenda20251031173825 implements MigrationInterface {
  name = 'CreatePedidosVenda20251031173825'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar enum de status de pedido de venda
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE status_pedido_venda_enum AS ENUM ('rascunho', 'pendente', 'em_preparacao', 'enviado', 'entregue', 'cancelado', 'faturado');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Verificar se a tabela já existe e dropar se necessário para recriar com todas as colunas
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pedidos_venda'
      );
    `);

    if (tableExists[0].exists) {
      // Se a tabela existe, adicionar colunas que podem estar faltando
      await queryRunner.query(`
        ALTER TABLE pedidos_venda
          ADD COLUMN IF NOT EXISTS numero varchar NULL,
          ADD COLUMN IF NOT EXISTS serie varchar NULL,
          ADD COLUMN IF NOT EXISTS "numeroOrdemCompra" varchar NULL,
          ADD COLUMN IF NOT EXISTS "orcamentoId" uuid NULL,
          ADD COLUMN IF NOT EXISTS "naturezaOperacaoPadraoId" uuid NULL,
          ADD COLUMN IF NOT EXISTS "formaPagamentoId" uuid NULL,
          ADD COLUMN IF NOT EXISTS "localEstoqueId" uuid NULL,
          ADD COLUMN IF NOT EXISTS parcelamento varchar NULL,
          ADD COLUMN IF NOT EXISTS "consumidorFinal" boolean NULL,
          ADD COLUMN IF NOT EXISTS "indicadorPresenca" varchar NULL,
          ADD COLUMN IF NOT EXISTS "listaPreco" varchar NULL,
          ADD COLUMN IF NOT EXISTS frete varchar NULL,
          ADD COLUMN IF NOT EXISTS "valorFrete" numeric(14,2) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS despesas numeric(14,2) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS "incluirFreteTotal" boolean NULL,
          ADD COLUMN IF NOT EXISTS "placaVeiculo" varchar NULL,
          ADD COLUMN IF NOT EXISTS "ufPlaca" varchar NULL,
          ADD COLUMN IF NOT EXISTS rntc varchar NULL,
          ADD COLUMN IF NOT EXISTS "pesoLiquido" numeric(14,3) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS "pesoBruto" numeric(14,3) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS volume numeric(14,3) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS especie varchar NULL,
          ADD COLUMN IF NOT EXISTS marca varchar NULL,
          ADD COLUMN IF NOT EXISTS numeracao varchar NULL,
          ADD COLUMN IF NOT EXISTS "quantidadeVolumes" integer NULL,
          ADD COLUMN IF NOT EXISTS "totalProdutos" numeric(14,2) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS "totalDescontos" numeric(14,2) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS "totalImpostos" numeric(14,2) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS "totalGeral" numeric(14,2) NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS observacoes text NULL,
          ADD COLUMN IF NOT EXISTS "dataEmissao" date NULL,
          ADD COLUMN IF NOT EXISTS "dataPrevisaoEntrega" date NULL,
          ADD COLUMN IF NOT EXISTS "dataEntrega" date NULL,
          ADD COLUMN IF NOT EXISTS "clienteId" uuid NULL,
          ADD COLUMN IF NOT EXISTS "vendedorId" uuid NULL,
          ADD COLUMN IF NOT EXISTS "transportadoraId" uuid NULL,
          ADD COLUMN IF NOT EXISTS "prazoPagamentoId" uuid NULL,
          ADD COLUMN IF NOT EXISTS "companyId" uuid NULL,
          ADD COLUMN IF NOT EXISTS status status_pedido_venda_enum NULL DEFAULT 'rascunho';
      `);
      
      // Atualizar tipo da coluna status se necessário - apenas se não for enum ainda
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'pedidos_venda' 
            AND column_name = 'status' 
            AND data_type = 'character varying'
          ) THEN
            -- Primeiro atualizar valores existentes para valores válidos do enum
            UPDATE pedidos_venda SET status = 'rascunho' WHERE status NOT IN ('rascunho', 'pendente', 'em_preparacao', 'enviado', 'entregue', 'cancelado', 'faturado');
            
            -- Remover default
            ALTER TABLE pedidos_venda ALTER COLUMN status DROP DEFAULT;
            
            -- Alterar tipo
            ALTER TABLE pedidos_venda ALTER COLUMN status TYPE status_pedido_venda_enum USING 
              CASE 
                WHEN status = 'rascunho' THEN 'rascunho'::status_pedido_venda_enum
                WHEN status = 'pendente' THEN 'pendente'::status_pedido_venda_enum
                WHEN status = 'em_preparacao' THEN 'em_preparacao'::status_pedido_venda_enum
                WHEN status = 'enviado' THEN 'enviado'::status_pedido_venda_enum
                WHEN status = 'entregue' THEN 'entregue'::status_pedido_venda_enum
                WHEN status = 'cancelado' THEN 'cancelado'::status_pedido_venda_enum
                WHEN status = 'faturado' THEN 'faturado'::status_pedido_venda_enum
                ELSE 'rascunho'::status_pedido_venda_enum
              END;
            
            -- Restaurar default
            ALTER TABLE pedidos_venda ALTER COLUMN status SET DEFAULT 'rascunho';
          END IF;
        END $$;
      `);
    } else {
      // Criar tabela pedidos_venda apenas se não existir
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS pedidos_venda (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          numero varchar NULL,
          serie varchar NULL,
          "numeroOrdemCompra" varchar NULL,
          "orcamentoId" uuid NULL,
          "dataEmissao" date NOT NULL,
          "dataPrevisaoEntrega" date NULL,
          "dataEntrega" date NULL,
          "clienteId" uuid NOT NULL,
          "vendedorId" uuid NULL,
          "transportadoraId" uuid NULL,
          "prazoPagamentoId" uuid NULL,
          "naturezaOperacaoPadraoId" uuid NULL,
          "formaPagamentoId" uuid NULL,
          parcelamento varchar NULL,
          "consumidorFinal" boolean NULL,
          "indicadorPresenca" varchar NULL,
          "localEstoqueId" uuid NULL,
          "listaPreco" varchar NULL,
          frete varchar NULL,
          "valorFrete" numeric(14,2) NULL DEFAULT 0,
          despesas numeric(14,2) NULL DEFAULT 0,
          "incluirFreteTotal" boolean NULL,
          "placaVeiculo" varchar NULL,
          "ufPlaca" varchar NULL,
          rntc varchar NULL,
          "pesoLiquido" numeric(14,3) NULL DEFAULT 0,
          "pesoBruto" numeric(14,3) NULL DEFAULT 0,
          volume numeric(14,3) NULL DEFAULT 0,
          especie varchar NULL,
          marca varchar NULL,
          numeracao varchar NULL,
          "quantidadeVolumes" integer NULL,
          "totalProdutos" numeric(14,2) NOT NULL DEFAULT 0,
          "totalDescontos" numeric(14,2) NOT NULL DEFAULT 0,
          "totalImpostos" numeric(14,2) NOT NULL DEFAULT 0,
          "totalGeral" numeric(14,2) NOT NULL DEFAULT 0,
          observacoes text NULL,
          status status_pedido_venda_enum NOT NULL DEFAULT 'rascunho',
          "companyId" uuid NOT NULL,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
      `);
    }

    // Criar tabela pedido_venda_itens
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pedido_venda_itens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "pedidoVendaId" uuid NOT NULL,
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
        "numeroItem" integer NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Criar índices
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pdv_company ON pedidos_venda("companyId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pdv_cliente ON pedidos_venda("clienteId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pdv_status ON pedidos_venda(status);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pdv_data ON pedidos_venda("dataEmissao");`);
    
    // Verificar se a coluna orcamentoId existe antes de criar o índice
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'pedidos_venda' AND column_name = 'orcamentoId'
        ) THEN
          CREATE INDEX IF NOT EXISTS idx_pdv_orcamento ON pedidos_venda("orcamentoId");
        END IF;
      END $$;
    `);
    
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pdvi_pedido ON pedido_venda_itens("pedidoVendaId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_pdvi_produto ON pedido_venda_itens("produtoId");`);

    // Foreign keys para pedidos_venda - apenas se não existirem
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'pedidos_venda' 
          AND constraint_name = 'fk_pdv_company'
        ) THEN
          ALTER TABLE pedidos_venda
            ADD CONSTRAINT fk_pdv_company FOREIGN KEY ("companyId") REFERENCES companies(id),
            ADD CONSTRAINT fk_pdv_cliente FOREIGN KEY ("clienteId") REFERENCES cadastros(id),
            ADD CONSTRAINT fk_pdv_vendedor FOREIGN KEY ("vendedorId") REFERENCES cadastros(id),
            ADD CONSTRAINT fk_pdv_transportadora FOREIGN KEY ("transportadoraId") REFERENCES cadastros(id),
            ADD CONSTRAINT fk_pdv_prazo FOREIGN KEY ("prazoPagamentoId") REFERENCES prazos_pagamento(id);
        END IF;
      END $$;
    `);
    
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'pedidos_venda' AND column_name = 'naturezaOperacaoPadraoId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'pedidos_venda' AND constraint_name = 'fk_pdv_natop_padrao'
        ) THEN
          ALTER TABLE pedidos_venda
            ADD CONSTRAINT fk_pdv_natop_padrao FOREIGN KEY ("naturezaOperacaoPadraoId") REFERENCES natureza_operacao(id);
        END IF;
      END $$;
    `);
    
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'pedidos_venda' AND column_name = 'formaPagamentoId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'pedidos_venda' AND constraint_name = 'fk_pdv_forma_pagamento'
        ) THEN
          ALTER TABLE pedidos_venda
            ADD CONSTRAINT fk_pdv_forma_pagamento FOREIGN KEY ("formaPagamentoId") REFERENCES formas_pagamento(id);
        END IF;
      END $$;
    `);
    
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'pedidos_venda' AND column_name = 'localEstoqueId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'pedidos_venda' AND constraint_name = 'fk_pdv_local_estoque'
        ) THEN
          ALTER TABLE pedidos_venda
            ADD CONSTRAINT fk_pdv_local_estoque FOREIGN KEY ("localEstoqueId") REFERENCES locais_estoque(id);
        END IF;
      END $$;
    `);
    
    // Adicionar FK de orcamentoId apenas se a coluna existir
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'pedidos_venda' AND column_name = 'orcamentoId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'pedidos_venda' AND constraint_name = 'fk_pdv_orcamento'
        ) THEN
          ALTER TABLE pedidos_venda
            ADD CONSTRAINT fk_pdv_orcamento FOREIGN KEY ("orcamentoId") REFERENCES orcamentos(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Foreign keys para pedido_venda_itens
    await queryRunner.query(`
      ALTER TABLE pedido_venda_itens
        ADD CONSTRAINT fk_pdvi_pedido FOREIGN KEY ("pedidoVendaId") REFERENCES pedidos_venda(id) ON DELETE CASCADE,
        ADD CONSTRAINT fk_pdvi_company FOREIGN KEY ("companyId") REFERENCES companies(id),
        ADD CONSTRAINT fk_pdvi_prod FOREIGN KEY ("produtoId") REFERENCES produtos(id),
        ADD CONSTRAINT fk_pdvi_natop FOREIGN KEY ("naturezaOperacaoId") REFERENCES natureza_operacao(id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS pedido_venda_itens;`);
    await queryRunner.query(`DROP TABLE IF EXISTS pedidos_venda;`);
    await queryRunner.query(`DROP TYPE IF EXISTS status_pedido_venda_enum;`);
  }
}

