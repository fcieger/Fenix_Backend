# 🗄️ Configuração Neon + Vercel - FENIX Backend

## 📋 **STATUS ATUAL**
- ✅ **Código configurado** para usar `DATABASE_URL`
- ✅ **TypeORM** configurado para Neon
- ✅ **SSL** configurado para produção
- ⚠️ **Variáveis de ambiente** precisam ser configuradas no Vercel

## 🔧 **CONFIGURAÇÃO NO VERCEL**

### **1. Acessar Painel da Vercel**
1. Acesse: https://vercel.com/dashboard
2. Encontre o projeto: **Fenix_Backend**
3. Clique em **Settings**
4. Vá em **Environment Variables**

### **2. Adicionar Variáveis de Ambiente**

#### **DATABASE_URL (OBRIGATÓRIO)**
```bash
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_YjvLSX3d8JNM@ep-silent-mouse-ahjow0rn-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environment: All Environments
```

#### **NODE_ENV (OBRIGATÓRIO)**
```bash
Key: NODE_ENV
Value: production
Environment: All Environments
```

#### **PORT (OBRIGATÓRIO)**
```bash
Key: PORT
Value: 3001
Environment: All Environments
```

#### **CORS_ORIGIN (OBRIGATÓRIO)**
```bash
Key: CORS_ORIGIN
Value: http://localhost:3004,https://fenixfrontendatual.vercel.app
Environment: All Environments
```

#### **JWT_SECRET (OBRIGATÓRIO)**
```bash
Key: JWT_SECRET
Value: fenix-jwt-secret-key-2024-super-secure
Environment: All Environments
```

#### **ENCRYPTION_KEY (OBRIGATÓRIO)**
```bash
Key: ENCRYPTION_KEY
Value: chave_de_criptografia_super_segura_123456789
Environment: All Environments
```

### **3. Redeploy Automático**
Após adicionar as variáveis:
1. O Vercel fará **redeploy automático**
2. Aguarde 2-3 minutos
3. Teste os endpoints

## 🧪 **TESTANDO APÓS CONFIGURAÇÃO**

### **1. Endpoint Simples (sem banco)**
```bash
curl https://fenix-backend.vercel.app/api/simple-health
```
**Resposta esperada:**
```json
{
  "status": "ok",
  "message": "Simple health check working",
  "timestamp": "2025-10-24T22:03:24.633Z"
}
```

### **2. Health Check Completo (com banco)**
```bash
curl https://fenix-backend.vercel.app/api/health
```
**Resposta esperada:**
```json
{
  "status": "ok",
  "environment": "production",
  "database": true,
  "redis": true,
  "timestamp": "2025-10-24T22:03:24.633Z"
}
```

### **3. Frontend Health Check**
```bash
curl https://fenixfrontendatual.vercel.app/api/health-check
```
**Resposta esperada:**
```json
{
  "frontend": "ok",
  "backend": "ok",
  "environment": "production",
  "database": true,
  "redis": true,
  "timestamp": "2025-10-24T22:03:24.633Z"
}
```

## 🚨 **TROUBLESHOOTING**

### **Erro 500 - FUNCTION_INVOCATION_FAILED**
**Causa:** Variáveis de ambiente não configuradas
**Solução:** Adicionar todas as variáveis no Vercel

### **Erro de Conexão com Banco**
**Causa:** DATABASE_URL incorreta
**Solução:** Verificar string de conexão no Neon

### **Erro de CORS**
**Causa:** CORS_ORIGIN não configurado
**Solução:** Adicionar CORS_ORIGIN no Vercel

### **Erro de SSL**
**Causa:** SSL não configurado para produção
**Solução:** Verificar se `sslmode=require` está na URL

## 📊 **MONITORAMENTO**

### **1. Logs do Vercel**
1. Acesse o painel da Vercel
2. Vá em **Functions → Logs**
3. Verifique erros de conexão

### **2. Dashboard do Neon**
1. Acesse: https://console.neon.tech
2. Vá em **Dashboard**
3. Monitore conexões ativas

### **3. Health Check Frontend**
```bash
# Testar conectividade completa
curl https://fenixfrontendatual.vercel.app/api/health-check
```

## 🎯 **PRÓXIMOS PASSOS**

1. **Configurar variáveis** no Vercel
2. **Aguardar redeploy** (2-3 minutos)
3. **Testar endpoints** de health check
4. **Verificar logs** se houver erros
5. **Monitorar performance** no Neon

## ✅ **CHECKLIST DE CONFIGURAÇÃO**

- [ ] DATABASE_URL configurada no Vercel
- [ ] NODE_ENV=production configurado
- [ ] PORT=3001 configurado
- [ ] CORS_ORIGIN configurado
- [ ] JWT_SECRET configurado
- [ ] ENCRYPTION_KEY configurado
- [ ] Redeploy automático concluído
- [ ] Endpoints testados e funcionando
- [ ] Logs verificados
- [ ] Performance monitorada
