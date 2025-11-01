# 🗄️ Como Inicializar TODAS as Tabelas no Neon

## ✅ Solução Completa Implementada

Agora você tem **DOIS endpoints** para inicializar todas as tabelas:

### 1. Frontend (Next.js) - `/api/init-db`
```
POST https://fenixfrontendatual.vercel.app/api/init-db
```

### 2. Backend (NestJS) - `/api/init-db`  
```
POST https://fenix-backend.vercel.app/api/init-db
```

## 🚀 Como Usar

### Opção 1: Via Frontend (Recomendado para testar rápido)

```bash
# Via navegador:
https://fenixfrontendatual.vercel.app/api/init-db

# Via curl:
curl -X POST https://fenixfrontendatual.vercel.app/api/init-db
```

### Opção 2: Via Backend (Recomendado para produção)

```bash
# Via navegador:
https://fenix-backend.vercel.app/api/init-db

# Via curl:
curl -X POST https://fenix-backend.vercel.app/api/init-db
```

## 📋 O que será criado:

✅ **30+ tabelas** incluindo:
- Core: users, companies, user_companies
- Cadastros: cadastros
- Produtos: produtos
- Fiscal: natureza_operacao, formas_pagamento, prazos_pagamento, configuracoes_nfe, certificados, nfe
- Orçamentos: orcamentos, orcamento_itens
- Vendas: pedidos_venda, pedidos_venda_itens
- Financeiro: contas_financeiras, movimentacoes_financeiras, centros_custos, contas_receber, parcelas_contas_receber
- Estoque: locais_estoque, estoque_movimentos, estoque_saldos, estoque_inventarios
- Outros: historico_eventos, _migrations

## ✅ Resposta Esperada:

```json
{
  "success": true,
  "message": "Banco de dados inicializado COMPLETAMENTE com sucesso!",
  "tablesCreated": 30,
  "executedStatements": 150,
  "skippedStatements": 50,
  "tables": [
    "_migrations",
    "cadastros",
    "certificados",
    "companies",
    "..."
  ]
}
```

## 🔄 Atualização Automática

O sistema também cria tabelas automaticamente quando:
- Você faz login pela primeira vez (frontend)
- Acessa qualquer endpoint que use o banco

## ⚠️ IMPORTANTE

- Ambos os endpoints são **idempotentes** - podem ser executados múltiplas vezes
- Tabelas já existentes são ignoradas automaticamente
- O endpoint retorna lista completa de todas as tabelas criadas

## 🎯 Próximos Passos

1. ✅ Aguardar deploy automático (2-3 minutos)
2. ✅ Executar um dos endpoints acima
3. ✅ Verificar resultado no console do Neon
4. ✅ Começar a usar o sistema!

