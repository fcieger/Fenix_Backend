# Como Criar Tabelas no Banco de Dados Neon

## 📋 Pré-requisitos

- Arquivo `.env` configurado com `DATABASE_URL` do Neon
- Dependências instaladas (`npm install`)

## 🚀 Passo a Passo

### Opção 1: Usando o Script (Recomendado)

1. Certifique-se de que o `.env` contém:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_YjvLSX3d8JNM@ep-silent-mouse-ahjow0rn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   PORT=3001
   NODE_ENV=development
   SYNC_TABLES=true
   ```

2. Inicie o servidor com sincronização habilitada:
   ```bash
   npm run create:tables
   ```

3. Aguarde o servidor iniciar. O TypeORM criará automaticamente todas as tabelas necessárias.

4. **IMPORTANTE**: Após criar as tabelas, remova ou comente a linha `SYNC_TABLES=true` do arquivo `.env` para evitar recriação das tabelas em execuções futuras.

### Opção 2: Usando Variável de Ambiente Temporária

1. Inicie o servidor com a variável `SYNC_TABLES`:
   ```bash
   SYNC_TABLES=true npm run start:dev
   ```

2. Aguarde o servidor iniciar e criar as tabelas.

3. Pare o servidor (Ctrl+C) e inicie normalmente:
   ```bash
   npm run start:dev
   ```

## 📊 Tabelas que Serão Criadas

O sistema criará automaticamente as seguintes tabelas baseadas nas entidades:

- `user` - Usuários do sistema
- `company` - Empresas
- `cadastro` - Cadastros (clientes/fornecedores)
- `produto` - Produtos
- `user_access_log` - Logs de acesso
- `natureza_operacao` - Naturezas de operação
- `configuracao_imposto_estado` - Configurações de impostos por estado
- `pedido_venda` - Pedidos de venda
- `pedido_venda_item` - Itens dos pedidos de venda
- `prazo_pagamento` - Prazos de pagamento
- `certificado` - Certificados digitais
- `configuracao_nfe` - Configurações de NFe
- `nfe` - Notas fiscais
- `nfe_item` - Itens das notas fiscais
- `nfe_duplicata` - Duplicatas das notas fiscais

## ⚠️ Importante

- **NUNCA** use `synchronize: true` em produção
- Após criar as tabelas, sempre use migrations para alterações futuras
- O `SYNC_TABLES=true` deve ser usado apenas uma vez para inicializar o banco
- As tabelas serão criadas automaticamente quando o servidor iniciar com `SYNC_TABLES=true`

## 🔍 Verificar Tabelas Criadas

Para verificar se as tabelas foram criadas, você pode usar o console SQL do Neon ou executar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

