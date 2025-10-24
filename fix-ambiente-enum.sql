-- Script para corrigir o enum ambiente na tabela configuracao_nfe
-- Atualiza os dados existentes de minúsculo para maiúsculo

-- Primeiro, atualiza os dados existentes
UPDATE configuracao_nfe SET ambiente = 'HOMOLOGACAO' WHERE ambiente = 'homologacao';
UPDATE configuracao_nfe SET ambiente = 'PRODUCAO' WHERE ambiente = 'producao';

-- Verifica se a atualização foi bem-sucedida
SELECT ambiente, COUNT(*) FROM configuracao_nfe GROUP BY ambiente;

