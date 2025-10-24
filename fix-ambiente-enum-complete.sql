-- Script completo para corrigir o enum ambiente na tabela configuracao_nfe
-- 1. Primeiro, altera o tipo da coluna para text temporariamente
-- 2. Atualiza os dados
-- 3. Altera o tipo de volta para o enum correto

-- Passo 1: Alterar coluna para text temporariamente
ALTER TABLE configuracao_nfe ALTER COLUMN ambiente TYPE text;

-- Passo 2: Atualizar os dados
UPDATE configuracao_nfe SET ambiente = 'HOMOLOGACAO' WHERE ambiente = 'homologacao';
UPDATE configuracao_nfe SET ambiente = 'PRODUCAO' WHERE ambiente = 'producao';

-- Passo 3: Recriar o enum com os valores corretos
DROP TYPE IF EXISTS configuracao_nfe_ambiente_enum_old;
ALTER TYPE configuracao_nfe_ambiente_enum RENAME TO configuracao_nfe_ambiente_enum_old;
CREATE TYPE configuracao_nfe_ambiente_enum AS ENUM('PRODUCAO', 'HOMOLOGACAO');

-- Passo 4: Alterar coluna de volta para o enum
ALTER TABLE configuracao_nfe ALTER COLUMN ambiente TYPE configuracao_nfe_ambiente_enum USING ambiente::configuracao_nfe_ambiente_enum;

-- Passo 5: Limpar o enum antigo
DROP TYPE configuracao_nfe_ambiente_enum_old;

-- Verificar resultado
SELECT ambiente, COUNT(*) FROM configuracao_nfe GROUP BY ambiente;

