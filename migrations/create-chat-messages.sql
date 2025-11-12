-- ============================================
-- MIGRAÇÃO: Criar tabela chat_messages
-- Data: 2024-11-12
-- Descrição: Tabela para armazenar histórico do Chat IA
-- ============================================

-- Criar tabela principal
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "companyId" UUID,
  "userMessage" TEXT NOT NULL,
  "aiResponse" TEXT NOT NULL,
  context JSONB,
  model VARCHAR(50) DEFAULT 'gpt-4o-mini',
  "tokensUsed" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_chat_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_company FOREIGN KEY ("companyId") REFERENCES companies(id) ON DELETE SET NULL
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_userId ON chat_messages("userId");
CREATE INDEX IF NOT EXISTS idx_chat_messages_companyId ON chat_messages("companyId");
CREATE INDEX IF NOT EXISTS idx_chat_messages_createdAt ON chat_messages("createdAt" DESC);

-- Adicionar comentários
COMMENT ON TABLE chat_messages IS 'Histórico de mensagens do Chat IA';
COMMENT ON COLUMN chat_messages.id IS 'ID único da mensagem';
COMMENT ON COLUMN chat_messages."userId" IS 'ID do usuário que enviou a mensagem';
COMMENT ON COLUMN chat_messages."companyId" IS 'ID da empresa (opcional)';
COMMENT ON COLUMN chat_messages."userMessage" IS 'Mensagem enviada pelo usuário';
COMMENT ON COLUMN chat_messages."aiResponse" IS 'Resposta gerada pela IA';
COMMENT ON COLUMN chat_messages.context IS 'Contexto da conversa (últimas mensagens)';
COMMENT ON COLUMN chat_messages.model IS 'Modelo da OpenAI utilizado';
COMMENT ON COLUMN chat_messages."tokensUsed" IS 'Quantidade de tokens consumidos';
COMMENT ON COLUMN chat_messages."createdAt" IS 'Data e hora da mensagem';

-- Verificar criação
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    RAISE NOTICE '✅ Tabela chat_messages criada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Erro ao criar tabela chat_messages';
  END IF;
END $$;

