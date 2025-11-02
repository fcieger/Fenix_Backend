-- Script para converter coluna status de integer para enum
-- Criar enum se não existir
DO $$ BEGIN
  CREATE TYPE status_pedido_venda_enum AS ENUM ('rascunho', 'pendente', 'em_preparacao', 'enviado', 'entregue', 'cancelado', 'faturado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Converter coluna status de integer para enum
ALTER TABLE pedidos_venda ALTER COLUMN status DROP DEFAULT;

ALTER TABLE pedidos_venda ALTER COLUMN status TYPE status_pedido_venda_enum USING 
  CASE 
    WHEN status::text = 'rascunho' OR status::integer = 0 THEN 'rascunho'::status_pedido_venda_enum
    WHEN status::text = 'pendente' OR status::integer = 1 THEN 'pendente'::status_pedido_venda_enum
    WHEN status::text = 'em_preparacao' OR status::integer = 2 THEN 'em_preparacao'::status_pedido_venda_enum
    WHEN status::text = 'enviado' OR status::integer = 3 THEN 'enviado'::status_pedido_venda_enum
    WHEN status::text = 'entregue' OR status::integer = 4 THEN 'entregue'::status_pedido_venda_enum
    WHEN status::text = 'cancelado' OR status::integer = 5 THEN 'cancelado'::status_pedido_venda_enum
    WHEN status::text = 'faturado' OR status::integer = 6 THEN 'faturado'::status_pedido_venda_enum
    ELSE 'rascunho'::status_pedido_venda_enum
  END;

ALTER TABLE pedidos_venda ALTER COLUMN status SET DEFAULT 'rascunho'::status_pedido_venda_enum;

SELECT 'Coluna status convertida para enum com sucesso!' as resultado;


