-- Script para adicionar todas as colunas faltantes na tabela pedidos_venda
-- Execute este script diretamente no PostgreSQL

-- Colunas de identificação
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS numero varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS serie varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "numeroOrdemCompra" varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "orcamentoId" uuid NULL;

-- Colunas de datas
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "dataEmissao" date NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "dataPrevisaoEntrega" date NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "dataEntrega" date NULL;

-- Colunas de relacionamentos
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "clienteId" uuid NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "vendedorId" uuid NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "transportadoraId" uuid NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "prazoPagamentoId" uuid NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "naturezaOperacaoPadraoId" uuid NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "formaPagamentoId" uuid NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "localEstoqueId" uuid NULL;

-- Colunas de configuração
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS parcelamento varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "consumidorFinal" boolean NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "indicadorPresenca" varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "listaPreco" varchar NULL;

-- Colunas de frete e despesas
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS frete varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "valorFrete" numeric(14,2) NULL DEFAULT 0;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS despesas numeric(14,2) NULL DEFAULT 0;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "incluirFreteTotal" boolean NULL;

-- Colunas de veículo
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "placaVeiculo" varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "ufPlaca" varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS rntc varchar NULL;

-- Colunas de volume e peso
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "pesoLiquido" numeric(14,3) NULL DEFAULT 0;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "pesoBruto" numeric(14,3) NULL DEFAULT 0;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS volume numeric(14,3) NULL DEFAULT 0;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS especie varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS marca varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS numeracao varchar NULL;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "quantidadeVolumes" integer NULL;

-- Colunas de totais
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "totalProdutos" numeric(14,2) NULL DEFAULT 0;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "totalDescontos" numeric(14,2) NULL DEFAULT 0;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "totalImpostos" numeric(14,2) NULL DEFAULT 0;
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "totalGeral" numeric(14,2) NULL DEFAULT 0;

-- Colunas de observações
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS observacoes text NULL;

-- Coluna de empresa
ALTER TABLE pedidos_venda ADD COLUMN IF NOT EXISTS "companyId" uuid NULL;

-- Criar enum de status se não existir
DO $$ BEGIN
  CREATE TYPE status_pedido_venda_enum AS ENUM ('rascunho', 'pendente', 'em_preparacao', 'enviado', 'entregue', 'cancelado', 'faturado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Adicionar coluna status se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pedidos_venda' AND column_name = 'status'
  ) THEN
    ALTER TABLE pedidos_venda ADD COLUMN status status_pedido_venda_enum NULL DEFAULT 'rascunho';
  END IF;
END $$;

SELECT 'Todas as colunas foram adicionadas/verificadas!' as resultado;


