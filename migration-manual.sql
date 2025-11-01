-- Migration manual para adicionar campos faltantes na tabela orcamentos
-- Execute este script SQL diretamente no banco de dados se a migration automática não funcionar

ALTER TABLE orcamentos
ADD COLUMN IF NOT EXISTS parcelamento varchar NULL,
ADD COLUMN IF NOT EXISTS "consumidorFinal" boolean NULL,
ADD COLUMN IF NOT EXISTS "indicadorPresenca" varchar NULL,
ADD COLUMN IF NOT EXISTS estoque varchar NULL,
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
ADD COLUMN IF NOT EXISTS "quantidadeVolumes" integer NULL;


