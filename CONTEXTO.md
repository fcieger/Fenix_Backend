# 📋 CONTEXTO DO PROJETO FENIX

## 🎯 **Visão Geral**
O **FENIX** é um **ERP (Enterprise Resource Planning)** desenvolvido especificamente para **pequenas empresas** brasileiras, com foco em **compliance fiscal** e **gestão de vendas**. O sistema oferece funcionalidades essenciais para empresas que precisam emitir NFe e gerenciar seus processos comerciais de forma integrada.

## 🏢 **Público-Alvo**
- **Pequenas empresas** (até 50 funcionários)
- **Empresas que emitem NFe** regularmente
- **Comércio e indústria** que precisam de controle fiscal
- **Empresas multi-estado** com operações em diferentes UFs

## 🚀 **Funcionalidades Principais**

### **1. Gestão Comercial**
- **Pedidos de Venda**: Criação, edição e controle de status
- **Clientes/Fornecedores**: Cadastro completo com endereços
- **Produtos**: Catálogo com informações fiscais
- **Vendedores**: Gestão de equipe comercial

### **2. Sistema Fiscal**
- **Cálculo Automático de Impostos**: ICMS, IPI, PIS, COFINS, ISS
- **Configurações por Estado**: Regras específicas por UF
- **Natureza de Operação**: Configurações flexíveis
- **CSTs Dinâmicos**: Estratégias baseadas em códigos tributários

### **3. Emissão de NFe**
- **NFe Completa**: Estrutura para emissão fiscal
- **Integração SEFAZ**: APIs para comunicação oficial
- **Certificados Digitais**: Gestão de certificados
- **Ambiente de Teste/Produção**: Configurações flexíveis

### **4. Gestão Empresarial**
- **Multi-tenant**: Suporte a múltiplas empresas
- **Usuários e Permissões**: Controle de acesso
- **Logs de Auditoria**: Rastreamento de alterações
- **Configurações por Empresa**: Personalização individual

## 🏗️ **Arquitetura Técnica**

### **Backend (NestJS)**
- **Framework**: NestJS 11.x com TypeScript
- **Banco**: PostgreSQL com TypeORM
- **Autenticação**: JWT + Passport
- **Containerização**: Docker + Docker Compose

### **Módulos Principais**
- **Auth**: Autenticação e autorização
- **Users**: Gestão de usuários
- **Companies**: Configurações por empresa
- **Cadastros**: Clientes, fornecedores, produtos
- **PedidosVenda**: Processo comercial
- **Impostos**: Cálculo fiscal
- **NFe**: Emissão fiscal
- **Certificados**: Gestão de certificados digitais

## 💼 **Casos de Uso Típicos**

### **1. Venda para Cliente**
1. Cliente cadastra pedido de venda
2. Sistema calcula impostos automaticamente
3. Gera NFe com dados fiscais corretos
4. Envia para SEFAZ e recebe autorização

### **2. Configuração Fiscal**
1. Empresa configura natureza de operação
2. Define regras por estado (UF)
3. Sistema aplica CSTs corretos
4. Calcula impostos baseado nas regras

### **3. Gestão Multi-empresa**
1. Cada empresa tem suas configurações
2. Usuários acessam apenas sua empresa
3. Dados isolados por tenant
4. Configurações independentes

## 🎯 **Diferenciais Competitivos**

### **1. Foco em Pequenas Empresas**
- Interface simples e intuitiva
- Configurações pré-definidas
- Onboarding facilitado
- Suporte especializado

### **2. Compliance Fiscal**
- Cálculos precisos de impostos
- Atualizações automáticas de regras
- Integração com SEFAZ
- Relatórios fiscais completos

### **3. Tecnologia Moderna**
- Arquitetura escalável
- Performance otimizada
- Segurança robusta
- Integração com APIs

## 📊 **Métricas de Negócio**

### **Empresas Atendidas**
- **Pequenas empresas** (1-50 funcionários)
- **Setores**: Comércio, Indústria, Serviços
- **Regiões**: Todas as UFs do Brasil
- **Volume**: Até 1000 NFe/mês por empresa

### **Funcionalidades Críticas**
- **Emissão de NFe**: 99.9% de disponibilidade
- **Cálculo de Impostos**: Precisão de 100%
- **Integração SEFAZ**: Tempo de resposta < 5s
- **Backup de Dados**: Diário automático

## 🔧 **Configurações Típicas**

### **Empresa Padrão**
- **CNPJ**: Configurado por empresa
- **Endereço**: UF de origem
- **Certificado**: A1 ou A3
- **Ambiente**: Homologação → Produção

### **Usuários**
- **Admin**: Acesso total
- **Vendedor**: Apenas pedidos
- **Fiscal**: Apenas NFe
- **Financeiro**: Apenas relatórios

## 🚀 **Roadmap**

### **Próximas Funcionalidades**
- **Dashboard Analytics**: Métricas de vendas
- **Integração Contábil**: Exportação para sistemas contábeis
- **Mobile App**: Acesso via smartphone
- **API Pública**: Integração com terceiros

### **Melhorias Técnicas**
- **Cache Redis**: Performance otimizada
- **Monitoramento**: Logs estruturados
- **Testes**: Cobertura aumentada
- **Segurança**: Validações rigorosas

## 📞 **Suporte e Documentação**

### **Canais de Suporte**
- **Email**: suporte@fenix.com.br
- **Chat**: Sistema integrado
- **Telefone**: (11) 99999-9999
- **Documentação**: Wiki completa

### **Recursos Disponíveis**
- **Manual do Usuário**: Passo a passo
- **Vídeos Tutoriais**: YouTube
- **FAQ**: Perguntas frequentes
- **Suporte Técnico**: Especializado

---

## 🎯 **Resumo Executivo**

O **FENIX** é um **ERP moderno e especializado** para pequenas empresas brasileiras, oferecendo **soluções fiscais completas** com **tecnologia de ponta**. O sistema combina **simplicidade de uso** com **robustez técnica**, permitindo que pequenas empresas tenham acesso a **funcionalidades enterprise** de forma **acessível e eficiente**.

**Diferencial**: Foco em **compliance fiscal** e **facilidade de uso**, tornando a gestão empresarial **simples e segura** para pequenas empresas.
