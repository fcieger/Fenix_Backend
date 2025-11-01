-- Schema Completo do Sistema FENIX
-- Este arquivo contém TODAS as tabelas necessárias para o sistema funcionar

-- ============================================
-- EXTENSÕES
-- ============================================
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================
-- TABELAS CORE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT,
  token TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  founded TEXT,
  nature TEXT,
  size TEXT,
  status TEXT,
  "mainActivity" TEXT,
  address JSONB,
  phones JSONB,
  emails JSONB,
  members JSONB,
  "defaultLocalEstoqueId" UUID,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_companies (
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  PRIMARY KEY ("userId", "companyId")
);

-- ============================================
-- TABELAS DE CADASTROS
-- ============================================
CREATE TABLE IF NOT EXISTS cadastros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "nomeRazaoSocial" TEXT NOT NULL,
  "nomeFantasia" TEXT,
  cpf TEXT,
  cnpj TEXT,
  "tipoPessoa" TEXT NOT NULL DEFAULT 'fisica',
  email TEXT,
  telefone TEXT,
  enderecos JSONB,
  "tiposCliente" TEXT[],
  "tiposFornecedor" TEXT[],
  "tiposTransportadora" TEXT[],
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELAS DE PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  "unidadeMedida" TEXT NOT NULL DEFAULT 'UN',
  ncm TEXT,
  cest TEXT,
  cfop TEXT,
  "precoVenda" NUMERIC(14,2) DEFAULT 0,
  "precoCusto" NUMERIC(14,2) DEFAULT 0,
  "controlaEstoque" BOOLEAN NOT NULL DEFAULT TRUE,
  "estoqueMinimo" NUMERIC(14,3) NOT NULL DEFAULT 0,
  "localPadraoId" UUID,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELAS FISCAIS
-- ============================================
CREATE TABLE IF NOT EXISTS natureza_operacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cfop TEXT NOT NULL,
  tipo TEXT DEFAULT 'vendas',
  "movimentaEstoque" BOOLEAN DEFAULT TRUE,
  habilitado BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS formas_pagamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  codigo TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prazos_pagamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  dias INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuracoes_nfe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "descricaoModelo" TEXT NOT NULL,
  "tipoModelo" TEXT NOT NULL,
  modelo TEXT NOT NULL,
  serie TEXT NOT NULL,
  "numeroAtual" INTEGER NOT NULL DEFAULT 1,
  ambiente TEXT NOT NULL DEFAULT 'homologacao',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("companyId", modelo, serie)
);

CREATE TABLE IF NOT EXISTS certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'a1',
  "certificadoData" TEXT,
  senha TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nfe (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  serie TEXT NOT NULL,
  modelo TEXT NOT NULL DEFAULT '55',
  "dataEmissao" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "clienteId" UUID REFERENCES cadastros(id),
  "pedidoVendaId" UUID,
  status TEXT NOT NULL DEFAULT 'pendente',
  "chaveAcesso" TEXT,
  "xmlAutorizado" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELAS DE ORÇAMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS orcamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  serie TEXT,
  "numeroOrdemCompra" TEXT,
  "dataEmissao" DATE NOT NULL DEFAULT CURRENT_DATE,
  "dataPrevisaoEntrega" DATE,
  "dataEntrega" DATE,
  "clienteId" UUID NOT NULL REFERENCES cadastros(id),
  "vendedorId" UUID REFERENCES cadastros(id),
  "transportadoraId" UUID REFERENCES cadastros(id),
  "prazoPagamentoId" UUID REFERENCES prazos_pagamento(id),
  "naturezaOperacaoPadraoId" UUID REFERENCES natureza_operacao(id),
  "formaPagamentoId" UUID REFERENCES formas_pagamento(id) ON DELETE SET NULL,
  "localEstoqueId" UUID,
  parcelamento TEXT,
  "consumidorFinal" BOOLEAN DEFAULT FALSE,
  "indicadorPresenca" TEXT,
  "listaPreco" TEXT,
  frete TEXT,
  "valorFrete" NUMERIC(14,2) DEFAULT 0,
  despesas NUMERIC(14,2) DEFAULT 0,
  "incluirFreteTotal" BOOLEAN DEFAULT FALSE,
  "placaVeiculo" TEXT,
  "ufPlaca" TEXT,
  rntc TEXT,
  "pesoLiquido" NUMERIC(14,3) DEFAULT 0,
  "pesoBruto" NUMERIC(14,3) DEFAULT 0,
  volume NUMERIC(14,3) DEFAULT 0,
  especie TEXT,
  marca TEXT,
  numeracao TEXT,
  "quantidadeVolumes" INTEGER,
  "totalProdutos" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "totalDescontos" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "totalImpostos" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "totalGeral" NUMERIC(14,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orcamento_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orcamentoId" UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "produtoId" UUID REFERENCES produtos(id),
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  unidade TEXT NOT NULL,
  ncm TEXT,
  cest TEXT,
  "naturezaOperacaoId" UUID NOT NULL REFERENCES natureza_operacao(id),
  quantidade NUMERIC(14,6) NOT NULL,
  "precoUnitario" NUMERIC(14,6) NOT NULL,
  "descontoValor" NUMERIC(14,2) DEFAULT 0,
  "descontoPercentual" NUMERIC(5,2) DEFAULT 0,
  "freteRateado" NUMERIC(14,2) DEFAULT 0,
  "seguroRateado" NUMERIC(14,2) DEFAULT 0,
  "outrasDespesasRateado" NUMERIC(14,2) DEFAULT 0,
  "icmsBase" NUMERIC(14,4),
  "icmsAliquota" NUMERIC(7,4),
  "icmsValor" NUMERIC(14,2),
  "icmsStBase" NUMERIC(14,4),
  "icmsStAliquota" NUMERIC(7,4),
  "icmsStValor" NUMERIC(14,2),
  "ipiAliquota" NUMERIC(7,4),
  "ipiValor" NUMERIC(14,2),
  "pisAliquota" NUMERIC(7,4),
  "pisValor" NUMERIC(14,2),
  "cofinsAliquota" NUMERIC(7,4),
  "cofinsValor" NUMERIC(14,2),
  "totalItem" NUMERIC(14,2) NOT NULL,
  observacoes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELAS DE PEDIDOS DE VENDA
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos_venda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "orcamentoId" UUID REFERENCES orcamentos(id),
  numero TEXT NOT NULL,
  serie TEXT,
  "numeroOrdemCompra" TEXT,
  "dataEmissao" DATE NOT NULL DEFAULT CURRENT_DATE,
  "dataPrevisaoEntrega" DATE,
  "dataEntrega" DATE,
  "clienteId" UUID NOT NULL REFERENCES cadastros(id),
  "vendedorId" UUID REFERENCES cadastros(id),
  "transportadoraId" UUID REFERENCES cadastros(id),
  "prazoPagamentoId" UUID REFERENCES prazos_pagamento(id),
  "naturezaOperacaoPadraoId" UUID REFERENCES natureza_operacao(id),
  "formaPagamentoId" UUID REFERENCES formas_pagamento(id) ON DELETE SET NULL,
  "localEstoqueId" UUID,
  parcelamento TEXT,
  "consumidorFinal" BOOLEAN DEFAULT FALSE,
  "indicadorPresenca" TEXT,
  "listaPreco" TEXT,
  frete TEXT,
  "valorFrete" NUMERIC(14,2) DEFAULT 0,
  despesas NUMERIC(14,2) DEFAULT 0,
  "incluirFreteTotal" BOOLEAN DEFAULT FALSE,
  "placaVeiculo" TEXT,
  "ufPlaca" TEXT,
  rntc TEXT,
  "pesoLiquido" NUMERIC(14,3) DEFAULT 0,
  "pesoBruto" NUMERIC(14,3) DEFAULT 0,
  volume NUMERIC(14,3) DEFAULT 0,
  especie TEXT,
  marca TEXT,
  numeracao TEXT,
  "quantidadeVolumes" INTEGER,
  "totalProdutos" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "totalDescontos" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "totalImpostos" NUMERIC(14,2) NOT NULL DEFAULT 0,
  "totalGeral" NUMERIC(14,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedidos_venda_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "pedidoVendaId" UUID NOT NULL REFERENCES pedidos_venda(id) ON DELETE CASCADE,
  "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  "produtoId" UUID REFERENCES produtos(id),
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  unidade TEXT NOT NULL,
  ncm TEXT,
  cest TEXT,
  "naturezaOperacaoId" UUID NOT NULL REFERENCES natureza_operacao(id),
  quantidade NUMERIC(14,6) NOT NULL,
  "precoUnitario" NUMERIC(14,6) NOT NULL,
  "descontoValor" NUMERIC(14,2) DEFAULT 0,
  "descontoPercentual" NUMERIC(5,2) DEFAULT 0,
  "freteRateado" NUMERIC(14,2) DEFAULT 0,
  "seguroRateado" NUMERIC(14,2) DEFAULT 0,
  "outrasDespesasRateado" NUMERIC(14,2) DEFAULT 0,
  "icmsBase" NUMERIC(14,4),
  "icmsAliquota" NUMERIC(7,4),
  "icmsValor" NUMERIC(14,2),
  "icmsStBase" NUMERIC(14,4),
  "icmsStAliquota" NUMERIC(7,4),
  "icmsStValor" NUMERIC(14,2),
  "ipiAliquota" NUMERIC(7,4),
  "ipiValor" NUMERIC(14,2),
  "pisAliquota" NUMERIC(7,4),
  "pisValor" NUMERIC(14,2),
  "cofinsAliquota" NUMERIC(7,4),
  "cofinsValor" NUMERIC(14,2),
  "totalItem" NUMERIC(14,2) NOT NULL,
  "numeroItem" INTEGER,
  observacoes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users("isActive");
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies("isActive");
CREATE INDEX IF NOT EXISTS idx_user_companies_user ON user_companies("userId");
CREATE INDEX IF NOT EXISTS idx_user_companies_company ON user_companies("companyId");

CREATE INDEX IF NOT EXISTS idx_cadastros_company ON cadastros("companyId");
CREATE INDEX IF NOT EXISTS idx_cadastros_cpf ON cadastros(cpf);
CREATE INDEX IF NOT EXISTS idx_cadastros_cnpj ON cadastros(cnpj);

CREATE INDEX IF NOT EXISTS idx_produtos_company ON produtos("companyId");
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON produtos(codigo);

CREATE INDEX IF NOT EXISTS idx_natureza_company ON natureza_operacao("companyId");
CREATE INDEX IF NOT EXISTS idx_formas_pagamento_company ON formas_pagamento("companyId");
CREATE INDEX IF NOT EXISTS idx_prazos_pagamento_company ON prazos_pagamento("companyId");
CREATE INDEX IF NOT EXISTS idx_config_nfe_company ON configuracoes_nfe("companyId");
CREATE INDEX IF NOT EXISTS idx_certificados_company ON certificados("companyId");
CREATE INDEX IF NOT EXISTS idx_nfe_company ON nfe("companyId");

CREATE INDEX IF NOT EXISTS idx_orcamentos_company ON orcamentos("companyId");
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente ON orcamentos("clienteId");
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento ON orcamento_itens("orcamentoId");

CREATE INDEX IF NOT EXISTS idx_pedidos_venda_company ON pedidos_venda("companyId");
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_cliente ON pedidos_venda("clienteId");
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_status ON pedidos_venda(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_venda_itens_pedido ON pedidos_venda_itens("pedidoVendaId");

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_users_updated_at ON users;
CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_companies_updated_at ON companies;
CREATE TRIGGER tr_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_cadastros_updated_at ON cadastros;
CREATE TRIGGER tr_cadastros_updated_at BEFORE UPDATE ON cadastros FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_produtos_updated_at ON produtos;
CREATE TRIGGER tr_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_natureza_updated_at ON natureza_operacao;
CREATE TRIGGER tr_natureza_updated_at BEFORE UPDATE ON natureza_operacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_formas_pagamento_updated_at ON formas_pagamento;
CREATE TRIGGER tr_formas_pagamento_updated_at BEFORE UPDATE ON formas_pagamento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_prazos_pagamento_updated_at ON prazos_pagamento;
CREATE TRIGGER tr_prazos_pagamento_updated_at BEFORE UPDATE ON prazos_pagamento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_config_nfe_updated_at ON configuracoes_nfe;
CREATE TRIGGER tr_config_nfe_updated_at BEFORE UPDATE ON configuracoes_nfe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_certificados_updated_at ON certificados;
CREATE TRIGGER tr_certificados_updated_at BEFORE UPDATE ON certificados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_nfe_updated_at ON nfe;
CREATE TRIGGER tr_nfe_updated_at BEFORE UPDATE ON nfe FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_orcamentos_updated_at ON orcamentos;
CREATE TRIGGER tr_orcamentos_updated_at BEFORE UPDATE ON orcamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_orcamento_itens_updated_at ON orcamento_itens;
CREATE TRIGGER tr_orcamento_itens_updated_at BEFORE UPDATE ON orcamento_itens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_pedidos_venda_updated_at ON pedidos_venda;
CREATE TRIGGER tr_pedidos_venda_updated_at BEFORE UPDATE ON pedidos_venda FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_pedidos_venda_itens_updated_at ON pedidos_venda_itens;
CREATE TRIGGER tr_pedidos_venda_itens_updated_at BEFORE UPDATE ON pedidos_venda_itens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

