-- SQL COMPLETO PARA CRIAR TODAS AS TABELAS NO NEON
-- Execute este script completo no console SQL do Neon

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABELAS BASE (sem dependências)
-- ============================================

-- users
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "email" character varying NOT NULL UNIQUE,
    "name" character varying NOT NULL,
    "phone" character varying NOT NULL,
    "password" character varying NOT NULL,
    "isActive" boolean NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_users" PRIMARY KEY ("id")
);

-- companies
CREATE TABLE IF NOT EXISTS "companies" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "cnpj" character varying NOT NULL UNIQUE,
    "name" character varying,
    "token" character varying NOT NULL UNIQUE,
    "isActive" boolean NOT NULL DEFAULT true,
    "founded" character varying,
    "nature" character varying,
    "size" character varying,
    "status" character varying,
    "address" jsonb,
    "mainActivity" character varying,
    "phones" jsonb,
    "emails" jsonb,
    "members" jsonb,
    "simplesNacional" boolean NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_companies" PRIMARY KEY ("id")
);

-- user_companies
CREATE TABLE IF NOT EXISTS "user_companies" (
    "userId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    CONSTRAINT "PK_user_companies" PRIMARY KEY ("userId", "companyId"),
    CONSTRAINT "FK_user_companies_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_user_companies_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE
);

-- cadastros
CREATE TABLE IF NOT EXISTS "cadastros" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nomeRazaoSocial" character varying NOT NULL,
    "nomeFantasia" character varying,
    "tipoPessoa" character varying NOT NULL,
    "cpf" character varying,
    "cnpj" character varying,
    "tiposCliente" jsonb,
    "email" character varying,
    "pessoaContato" character varying,
    "telefoneComercial" character varying,
    "celular" character varying,
    "cargo" character varying,
    "celularContato" character varying,
    "optanteSimples" boolean NOT NULL DEFAULT false,
    "orgaoPublico" boolean NOT NULL DEFAULT false,
    "ie" character varying,
    "im" character varying,
    "suframa" character varying,
    "contatos" jsonb,
    "enderecos" jsonb,
    "observacoes" text,
    "companyId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_cadastros" PRIMARY KEY ("id"),
    CONSTRAINT "FK_cadastros_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id")
);

-- produtos
CREATE TABLE IF NOT EXISTS "produtos" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nome" character varying NOT NULL,
    "apelido" character varying,
    "sku" character varying,
    "descricao" text,
    "ativo" boolean NOT NULL DEFAULT true,
    "tipoProduto" character varying,
    "unidadeMedida" character varying,
    "marca" character varying,
    "referencia" character varying,
    "codigoBarras" character varying,
    "ncm" character varying,
    "cest" character varying,
    "tipoProdutoSped" character varying,
    "origemProdutoSped" character varying,
    "categoriaProduto" character varying,
    "custo" numeric(10,2),
    "preco" numeric(10,2),
    "produtoInativo" boolean NOT NULL DEFAULT false,
    "usarApelidoComoNomePrincipal" boolean NOT NULL DEFAULT false,
    "integracaoMarketplace" boolean NOT NULL DEFAULT false,
    "peso" numeric(10,2),
    "altura" numeric(10,2),
    "largura" numeric(10,2),
    "profundidade" numeric(10,2),
    "pesoLiquido" numeric(10,2),
    "pesoBruto" numeric(10,2),
    "alturaEmbalagem" numeric(10,2),
    "larguraEmbalagem" numeric(10,2),
    "profundidadeEmbalagem" numeric(10,2),
    "pesoEmbalagem" numeric(10,2),
    "quantidadePorEmbalagem" integer,
    "tipoEmbalagem" character varying,
    "cor" character varying,
    "tamanho" character varying,
    "material" character varying,
    "modelo" character varying,
    "voltagem" character varying,
    "potencia" character varying,
    "capacidade" character varying,
    "garantiaMeses" integer,
    "certificacoes" character varying,
    "normasTecnicas" character varying,
    "fabricante" character varying,
    "fornecedorPrincipal" character varying,
    "paisOrigem" character varying,
    "linkFichaTecnica" character varying,
    "observacoesTecnicas" text,
    "companyId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_produtos" PRIMARY KEY ("id"),
    CONSTRAINT "FK_produtos_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id")
);

-- user_access_logs
CREATE TABLE IF NOT EXISTS "user_access_logs" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "userId" uuid NOT NULL,
    "ipAddress" character varying(45),
    "userAgent" text,
    "endpoint" character varying(255),
    "method" character varying(10),
    "statusCode" integer DEFAULT 200,
    "responseTime" integer DEFAULT 0,
    "referer" character varying(255),
    "sessionId" character varying(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_user_access_logs" PRIMARY KEY ("id"),
    CONSTRAINT "FK_user_access_logs_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- natureza_operacao
CREATE TABLE IF NOT EXISTS "natureza_operacao" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nome" character varying NOT NULL,
    "cfop" character varying(4) NOT NULL,
    "tipo" character varying(50) NOT NULL DEFAULT 'vendas',
    "movimentaEstoque" boolean NOT NULL DEFAULT false,
    "habilitado" boolean NOT NULL DEFAULT true,
    "considerarOperacaoComoFaturamento" boolean NOT NULL DEFAULT false,
    "destacarTotalImpostosIBPT" boolean NOT NULL DEFAULT false,
    "gerarContasReceberPagar" boolean NOT NULL DEFAULT false,
    "tipoDataContasReceberPagar" character varying(20),
    "informacoesAdicionaisFisco" text,
    "informacoesAdicionaisContribuinte" text,
    "companyId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_natureza_operacao" PRIMARY KEY ("id"),
    CONSTRAINT "FK_natureza_operacao_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id")
);

-- configuracao_imposto_estado
CREATE TABLE IF NOT EXISTS "configuracao_imposto_estado" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "naturezaOperacaoId" uuid NOT NULL,
    "ufOrigem" character varying(2) NOT NULL,
    "ufDestino" character varying(2) NOT NULL,
    "icmsAliquota" numeric(7,4),
    "icmsStAliquota" numeric(7,4),
    "ipiAliquota" numeric(7,4),
    "pisAliquota" numeric(7,4),
    "cofinsAliquota" numeric(7,4),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_configuracao_imposto_estado" PRIMARY KEY ("id"),
    CONSTRAINT "FK_configuracao_imposto_estado_naturezaOperacaoId" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "natureza_operacao"("id") ON DELETE CASCADE
);

-- prazos_pagamento
DO $$ BEGIN
    CREATE TYPE "prazos_pagamento_tipo_enum" AS ENUM('dias', 'parcelas', 'personalizado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "prazos_pagamento" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nome" character varying(255) NOT NULL,
    "descricao" character varying(500),
    "tipo" "prazos_pagamento_tipo_enum" DEFAULT 'dias',
    "configuracoes" jsonb NOT NULL,
    "ativo" boolean NOT NULL DEFAULT true,
    "padrao" boolean NOT NULL DEFAULT false,
    "observacoes" text,
    "company_id" uuid NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_prazos_pagamento" PRIMARY KEY ("id"),
    CONSTRAINT "FK_prazos_pagamento_companyId" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
);

-- formas_pagamento
CREATE TABLE IF NOT EXISTS "formas_pagamento" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nome" character varying(100) NOT NULL,
    "descricao" character varying,
    "ativo" boolean NOT NULL DEFAULT true,
    "padrao" boolean NOT NULL DEFAULT false,
    "companyId" uuid NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_formas_pagamento" PRIMARY KEY ("id"),
    CONSTRAINT "FK_formas_pagamento_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id")
);

-- locais_estoque
CREATE TABLE IF NOT EXISTS "locais_estoque" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nome" character varying NOT NULL,
    "codigo" character varying,
    "ativo" boolean NOT NULL DEFAULT true,
    "companyId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_locais_estoque" PRIMARY KEY ("id"),
    CONSTRAINT "FK_locais_estoque_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id")
);

-- certificados
DO $$ BEGIN
    CREATE TYPE "certificados_tipo_enum" AS ENUM('A1', 'A3');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "certificados_status_enum" AS ENUM('ativo', 'expirado', 'inativo');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "certificados" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nome" character varying(255) NOT NULL,
    "cnpj" character varying(18) NOT NULL,
    "validade" date NOT NULL,
    "tipo" "certificados_tipo_enum" NOT NULL,
    "status" "certificados_status_enum" NOT NULL DEFAULT 'ativo',
    "nomeArquivo" character varying(255) NOT NULL,
    "caminhoArquivo" character varying(500) NOT NULL,
    "hashArquivo" character varying(64) NOT NULL,
    "senhaCriptografada" character varying(500) NOT NULL,
    "observacoes" text,
    "ultimaVerificacao" TIMESTAMP NOT NULL DEFAULT now(),
    "companyId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_certificados" PRIMARY KEY ("id"),
    CONSTRAINT "FK_certificados_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE
);

-- configuracao_nfe
DO $$ BEGIN
    CREATE TYPE "configuracao_nfe_tipo_modelo_enum" AS ENUM('NFe', 'NFCe', 'NFS-e');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "configuracao_nfe_ambiente_enum" AS ENUM('PRODUCAO', 'HOMOLOGACAO');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "configuracao_nfe" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "company_id" uuid NOT NULL,
    "descricao_modelo" character varying NOT NULL,
    "tipo_modelo" "configuracao_nfe_tipo_modelo_enum" NOT NULL,
    "modelo" character varying NOT NULL,
    "serie" character varying NOT NULL,
    "numero_atual" integer NOT NULL DEFAULT 0,
    "ambiente" "configuracao_nfe_ambiente_enum" NOT NULL,
    "ativo" boolean NOT NULL DEFAULT true,
    "rps_natureza_operacao" character varying,
    "rps_regime_tributario" character varying,
    "rps_regime_especial_tributacao" character varying,
    "rps_numero_lote_atual" integer NOT NULL DEFAULT 0,
    "rps_serie_lote_atual" integer NOT NULL DEFAULT 0,
    "rps_login_prefeitura" character varying,
    "rps_senha_prefeitura" character varying,
    "rps_aliquota_iss" numeric(5,2) NOT NULL DEFAULT 0,
    "rps_enviar_notificacao_cliente" boolean NOT NULL DEFAULT false,
    "rps_receber_notificacao" boolean NOT NULL DEFAULT false,
    "rps_email_notificacao" character varying,
    "nfce_id_token" character varying,
    "nfce_csc_token" character varying,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_configuracao_nfe" PRIMARY KEY ("id"),
    CONSTRAINT "FK_configuracao_nfe_companyId" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
    CONSTRAINT "UQ_configuracao_nfe_company_modelo_serie" UNIQUE ("company_id", "modelo", "serie")
);

-- contas_financeiras
CREATE TABLE IF NOT EXISTS "contas_financeiras" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "companyId" uuid NOT NULL,
    "descricao" character varying(255) NOT NULL,
    "banco_id" character varying(10),
    "banco_nome" character varying(255),
    "banco_codigo" character varying(10),
    "numero_agencia" character varying(20),
    "numero_conta" character varying(20),
    "tipo_conta" character varying(20),
    "tipo_pessoa" character varying(20),
    "saldo_inicial" numeric(15,2) NOT NULL DEFAULT 0,
    "data_abertura" date NOT NULL,
    "status" character varying(20) NOT NULL DEFAULT 'ativo',
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_contas_financeiras" PRIMARY KEY ("id"),
    CONSTRAINT "FK_contas_financeiras_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id")
);

-- ============================================
-- 2. TABELAS DE ORÇAMENTOS
-- ============================================

DO $$ BEGIN
    CREATE TYPE "orcamentos_status_enum" AS ENUM('pendente', 'concluido');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "orcamentos" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "numero" character varying,
    "serie" character varying,
    "numeroPedidoCotacao" character varying,
    "dataEmissao" date NOT NULL,
    "dataPrevisaoEntrega" date,
    "dataValidade" date,
    "clienteId" uuid NOT NULL,
    "vendedorId" uuid,
    "transportadoraId" uuid,
    "prazoPagamentoId" uuid,
    "naturezaOperacaoPadraoId" uuid,
    "formaPagamentoId" uuid,
    "localEstoqueId" uuid,
    "parcelamento" character varying,
    "consumidorFinal" boolean,
    "indicadorPresenca" character varying,
    "frete" character varying,
    "valorFrete" numeric(14,2),
    "despesas" numeric(14,2),
    "incluirFreteTotal" boolean DEFAULT false,
    "pesoLiquido" numeric(14,3) DEFAULT '0',
    "pesoBruto" numeric(14,3) DEFAULT '0',
    "volume" numeric(14,3) DEFAULT '0',
    "totalProdutos" numeric(14,2) NOT NULL DEFAULT 0,
    "totalDescontos" numeric(14,2) NOT NULL DEFAULT 0,
    "totalImpostos" numeric(14,2) NOT NULL DEFAULT 0,
    "totalGeral" numeric(14,2) NOT NULL DEFAULT 0,
    "observacoes" text,
    "status" "orcamentos_status_enum" NOT NULL DEFAULT 'pendente',
    "companyId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_orcamentos" PRIMARY KEY ("id"),
    CONSTRAINT "FK_orcamentos_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id"),
    CONSTRAINT "FK_orcamentos_clienteId" FOREIGN KEY ("clienteId") REFERENCES "cadastros"("id"),
    CONSTRAINT "FK_orcamentos_vendedorId" FOREIGN KEY ("vendedorId") REFERENCES "cadastros"("id"),
    CONSTRAINT "FK_orcamentos_transportadoraId" FOREIGN KEY ("transportadoraId") REFERENCES "cadastros"("id"),
    CONSTRAINT "FK_orcamentos_prazoPagamentoId" FOREIGN KEY ("prazoPagamentoId") REFERENCES "prazos_pagamento"("id"),
    CONSTRAINT "FK_orcamentos_naturezaOperacaoPadraoId" FOREIGN KEY ("naturezaOperacaoPadraoId") REFERENCES "natureza_operacao"("id"),
    CONSTRAINT "FK_orcamentos_formaPagamentoId" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento"("id"),
    CONSTRAINT "FK_orcamentos_localEstoqueId" FOREIGN KEY ("localEstoqueId") REFERENCES "locais_estoque"("id")
);

CREATE TABLE IF NOT EXISTS "orcamento_itens" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "orcamentoId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "produtoId" uuid,
    "naturezaOperacaoId" uuid NOT NULL,
    "codigo" character varying NOT NULL,
    "nome" character varying NOT NULL,
    "unidade" character varying NOT NULL,
    "ncm" character varying,
    "cest" character varying,
    "quantidade" numeric(14,6) NOT NULL,
    "precoUnitario" numeric(14,6) NOT NULL,
    "descontoValor" numeric(14,2) NOT NULL DEFAULT '0',
    "descontoPercentual" numeric(5,2) NOT NULL DEFAULT '0',
    "freteRateado" numeric(14,2) NOT NULL DEFAULT '0',
    "seguroRateado" numeric(14,2) NOT NULL DEFAULT '0',
    "outrasDespesasRateado" numeric(14,2) NOT NULL DEFAULT '0',
    "icmsBase" numeric(14,4),
    "icmsAliquota" numeric(7,4),
    "icmsValor" numeric(14,2),
    "icmsStBase" numeric(14,4),
    "icmsStAliquota" numeric(7,4),
    "icmsStValor" numeric(14,2),
    "ipiAliquota" numeric(7,4),
    "ipiValor" numeric(14,2),
    "pisAliquota" numeric(7,4),
    "pisValor" numeric(14,2),
    "cofinsAliquota" numeric(7,4),
    "cofinsValor" numeric(14,2),
    "totalItem" numeric(14,2) NOT NULL,
    "observacoes" text,
    "numeroItem" integer,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_orcamento_itens" PRIMARY KEY ("id"),
    CONSTRAINT "FK_orcamento_itens_orcamentoId" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_orcamento_itens_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id"),
    CONSTRAINT "FK_orcamento_itens_produtoId" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id"),
    CONSTRAINT "FK_orcamento_itens_naturezaOperacaoId" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "natureza_operacao"("id")
);

-- ============================================
-- 3. TABELAS DE PEDIDOS DE VENDA
-- ============================================

DO $$ BEGIN
    CREATE TYPE "pedidos_venda_status_enum" AS ENUM('rascunho', 'pendente', 'em_preparacao', 'enviado', 'entregue', 'cancelado', 'faturado');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "pedidos_venda" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "numero" character varying,
    "serie" character varying,
    "numeroOrdemCompra" character varying,
    "orcamentoId" uuid,
    "dataEmissao" date NOT NULL,
    "dataPrevisaoEntrega" date,
    "dataEntrega" date,
    "clienteId" uuid NOT NULL,
    "vendedorId" uuid,
    "transportadoraId" uuid,
    "prazoPagamentoId" uuid,
    "naturezaOperacaoPadraoId" uuid,
    "formaPagamentoId" uuid,
    "localEstoqueId" uuid,
    "parcelamento" character varying,
    "consumidorFinal" boolean,
    "indicadorPresenca" character varying,
    "listaPreco" character varying,
    "frete" character varying,
    "valorFrete" numeric(14,2) DEFAULT 0,
    "despesas" numeric(14,2) DEFAULT 0,
    "incluirFreteTotal" boolean,
    "placaVeiculo" character varying,
    "ufPlaca" character varying,
    "rntc" character varying,
    "pesoLiquido" numeric(14,3) DEFAULT '0',
    "pesoBruto" numeric(14,3) DEFAULT '0',
    "volume" numeric(14,3) DEFAULT '0',
    "especie" character varying,
    "marca" character varying,
    "numeracao" character varying,
    "quantidadeVolumes" integer,
    "totalProdutos" numeric(14,2) NOT NULL DEFAULT 0,
    "totalDescontos" numeric(14,2) NOT NULL DEFAULT 0,
    "totalImpostos" numeric(14,2) NOT NULL DEFAULT 0,
    "totalGeral" numeric(14,2) NOT NULL DEFAULT 0,
    "observacoes" text,
    "status" "pedidos_venda_status_enum" NOT NULL DEFAULT 'rascunho',
    "companyId" uuid NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_pedidos_venda" PRIMARY KEY ("id"),
    CONSTRAINT "FK_pedidos_venda_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id"),
    CONSTRAINT "FK_pedidos_venda_clienteId" FOREIGN KEY ("clienteId") REFERENCES "cadastros"("id"),
    CONSTRAINT "FK_pedidos_venda_vendedorId" FOREIGN KEY ("vendedorId") REFERENCES "cadastros"("id"),
    CONSTRAINT "FK_pedidos_venda_transportadoraId" FOREIGN KEY ("transportadoraId") REFERENCES "cadastros"("id"),
    CONSTRAINT "FK_pedidos_venda_prazoPagamentoId" FOREIGN KEY ("prazoPagamentoId") REFERENCES "prazos_pagamento"("id"),
    CONSTRAINT "FK_pedidos_venda_naturezaOperacaoPadraoId" FOREIGN KEY ("naturezaOperacaoPadraoId") REFERENCES "natureza_operacao"("id"),
    CONSTRAINT "FK_pedidos_venda_formaPagamentoId" FOREIGN KEY ("formaPagamentoId") REFERENCES "formas_pagamento"("id"),
    CONSTRAINT "FK_pedidos_venda_localEstoqueId" FOREIGN KEY ("localEstoqueId") REFERENCES "locais_estoque"("id"),
    CONSTRAINT "FK_pedidos_venda_orcamentoId" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "pedido_venda_itens" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "pedidoVendaId" uuid NOT NULL,
    "companyId" uuid NOT NULL,
    "produtoId" uuid,
    "naturezaOperacaoId" uuid NOT NULL,
    "codigo" character varying NOT NULL,
    "nome" character varying NOT NULL,
    "unidade" character varying NOT NULL,
    "ncm" character varying,
    "cest" character varying,
    "quantidade" numeric(14,6) NOT NULL,
    "precoUnitario" numeric(14,6) NOT NULL,
    "descontoValor" numeric(14,2) NOT NULL DEFAULT '0',
    "descontoPercentual" numeric(5,2) NOT NULL DEFAULT '0',
    "freteRateado" numeric(14,2) NOT NULL DEFAULT '0',
    "seguroRateado" numeric(14,2) NOT NULL DEFAULT '0',
    "outrasDespesasRateado" numeric(14,2) NOT NULL DEFAULT '0',
    "icmsBase" numeric(14,4),
    "icmsAliquota" numeric(7,4),
    "icmsValor" numeric(14,2),
    "icmsStBase" numeric(14,4),
    "icmsStAliquota" numeric(7,4),
    "icmsStValor" numeric(14,2),
    "ipiAliquota" numeric(7,4),
    "ipiValor" numeric(14,2),
    "pisAliquota" numeric(7,4),
    "pisValor" numeric(14,2),
    "cofinsAliquota" numeric(7,4),
    "cofinsValor" numeric(14,2),
    "totalItem" numeric(14,2) NOT NULL,
    "observacoes" text,
    "numeroItem" integer,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_pedido_venda_itens" PRIMARY KEY ("id"),
    CONSTRAINT "FK_pedido_venda_itens_pedidoVendaId" FOREIGN KEY ("pedidoVendaId") REFERENCES "pedidos_venda"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_pedido_venda_itens_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id"),
    CONSTRAINT "FK_pedido_venda_itens_produtoId" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id"),
    CONSTRAINT "FK_pedido_venda_itens_naturezaOperacaoId" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "natureza_operacao"("id")
);

-- ============================================
-- 4. TABELAS DE NFE
-- ============================================

DO $$ BEGIN
    CREATE TYPE "nfe_status_enum" AS ENUM('RASCUNHO', 'PENDENTE', 'AUTORIZADA', 'CANCELADA', 'REJEITADA');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "nfe_ambiente_enum" AS ENUM('PRODUCAO', 'HOMOLOGACAO');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "nfe_tipooperacao_enum" AS ENUM('ENTRADA', 'SAIDA');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "nfe_finalidade_enum" AS ENUM('NORMAL', 'COMPLEMENTAR', 'AJUSTE', 'DEVOLUCAO');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "nfe_indicadorpresenca_enum" AS ENUM('NAO_SE_APLICA', 'PRESENCIAL', 'INTERNET', 'TELEATENDIMENTO', 'NFCe_ENTREGA_DOMICILIO', 'NFCe_PRESENCIAL_FORA_ESTABELECIMENTO', 'OUTROS');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "nfe_destinatarioindicadorie_enum" AS ENUM('CONTRIBUINTE_ICMS', 'CONTRIBUINTE_ISENTO', 'NAO_CONTRIBUINTE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "nfe_modalidadefrete_enum" AS ENUM('SEM_FRETE', 'POR_CONTA_EMITENTE', 'POR_CONTA_DESTINATARIO', 'POR_CONTA_TERCEIROS');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "nfe_formapagamento_enum" AS ENUM('VISTA', 'PRAZO');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "nfe_meiopagamento_enum" AS ENUM('DINHEIRO', 'CHEQUE', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'CARTAO_LOJA', 'VALE_ALIMENTACAO', 'VALE_REFEICAO', 'VALE_PRESENTE', 'VALE_COMBUSTIVEL', 'OUTROS', 'SEM_PAGAMENTO', 'TRANSFERENCIA_BANCARIA', 'BOLETO_BANCARIO', 'PIX');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "nfe" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "companyId" uuid NOT NULL,
    "numeroNfe" character varying(9) NOT NULL,
    "serie" character varying(3) NOT NULL,
    "modelo" character varying(2) NOT NULL,
    "configuracaoNfeId" uuid NOT NULL,
    "chaveAcesso" character varying(44),
    "status" "nfe_status_enum" NOT NULL DEFAULT 'RASCUNHO',
    "ambiente" "nfe_ambiente_enum" NOT NULL,
    "tipoOperacao" "nfe_tipooperacao_enum" NOT NULL,
    "finalidade" "nfe_finalidade_enum" NOT NULL,
    "naturezaOperacaoId" uuid NOT NULL,
    "consumidorFinal" boolean NOT NULL,
    "indicadorPresenca" "nfe_indicadorpresenca_enum" NOT NULL,
    "destinatarioId" uuid,
    "destinatarioTipo" character varying(1) NOT NULL,
    "destinatarioCnpjCpf" character varying(14) NOT NULL,
    "destinatarioRazaoSocial" character varying(60) NOT NULL,
    "destinatarioNomeFantasia" character varying(60),
    "destinatarioIE" character varying(14),
    "destinatarioIM" character varying(15),
    "destinatarioIndicadorIE" "nfe_destinatarioindicadorie_enum",
    "destinatarioLogradouro" character varying(60) NOT NULL,
    "destinatarioNumero" character varying(10) NOT NULL,
    "destinatarioComplemento" character varying(60),
    "destinatarioBairro" character varying(60) NOT NULL,
    "destinatarioMunicipio" character varying(60) NOT NULL,
    "destinatarioUF" character varying(2) NOT NULL,
    "destinatarioCEP" character varying(8) NOT NULL,
    "destinatarioCodigoMunicipio" character varying(7),
    "destinatarioPais" character varying(60) NOT NULL DEFAULT 'Brasil',
    "destinatarioCodigoPais" character varying(4) NOT NULL DEFAULT '1058',
    "destinatarioTelefone" character varying(20),
    "destinatarioEmail" character varying(60),
    "dataEmissao" TIMESTAMP NOT NULL,
    "dataSaida" TIMESTAMP,
    "horaSaida" TIME,
    "dataAutorizacao" TIMESTAMP,
    "valorTotalProdutos" numeric(15,2) NOT NULL DEFAULT '0',
    "baseCalculoICMS" numeric(15,2) NOT NULL DEFAULT '0',
    "valorICMS" numeric(15,2) NOT NULL DEFAULT '0',
    "baseCalculoICMSST" numeric(15,2) NOT NULL DEFAULT '0',
    "valorICMSST" numeric(15,2) NOT NULL DEFAULT '0',
    "valorFrete" numeric(15,2) NOT NULL DEFAULT '0',
    "valorSeguro" numeric(15,2) NOT NULL DEFAULT '0',
    "valorDesconto" numeric(15,2) NOT NULL DEFAULT '0',
    "outrasDespesas" numeric(15,2) NOT NULL DEFAULT '0',
    "valorIPI" numeric(15,2) NOT NULL DEFAULT '0',
    "valorPIS" numeric(15,2) NOT NULL DEFAULT '0',
    "valorCOFINS" numeric(15,2) NOT NULL DEFAULT '0',
    "tributosAproximados" numeric(15,2) NOT NULL DEFAULT '0',
    "valorTotalNota" numeric(15,2) NOT NULL DEFAULT '0',
    "modalidadeFrete" "nfe_modalidadefrete_enum",
    "incluirFreteTotal" boolean NOT NULL DEFAULT false,
    "transportadoraId" uuid,
    "transportadoraNome" character varying(60),
    "transportadoraCnpj" character varying(14),
    "transportadoraIE" character varying(14),
    "veiculoPlaca" character varying(7),
    "veiculoUF" character varying(2),
    "volumes" jsonb,
    "formaPagamento" "nfe_formapagamento_enum",
    "meioPagamento" "nfe_meiopagamento_enum",
    "informacoesComplementares" text,
    "informacoesFisco" text,
    "numeroPedido" character varying(15),
    "xmlNfe" text,
    "xmlRetorno" text,
    "protocoloAutorizacao" character varying(15),
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_nfe" PRIMARY KEY ("id"),
    CONSTRAINT "FK_nfe_companyId" FOREIGN KEY ("companyId") REFERENCES "companies"("id"),
    CONSTRAINT "FK_nfe_configuracaoNfeId" FOREIGN KEY ("configuracaoNfeId") REFERENCES "configuracao_nfe"("id"),
    CONSTRAINT "FK_nfe_naturezaOperacaoId" FOREIGN KEY ("naturezaOperacaoId") REFERENCES "natureza_operacao"("id")
);

CREATE TABLE IF NOT EXISTS "nfe_itens" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nfeId" uuid NOT NULL,
    "produtoId" uuid,
    "numeroItem" integer NOT NULL,
    "codigo" character varying(20) NOT NULL,
    "descricao" character varying(120) NOT NULL,
    "ncm" character varying(8),
    "cest" character varying(7),
    "cfop" character varying(4) NOT NULL,
    "unidadeComercial" character varying(6) NOT NULL,
    "unidadeTributavel" character varying(6) NOT NULL,
    "quantidade" numeric(15,4) NOT NULL,
    "quantidadeTributavel" numeric(15,4) NOT NULL,
    "valorUnitario" numeric(15,4) NOT NULL,
    "valorUnitarioTributavel" numeric(15,4) NOT NULL,
    "valorTotal" numeric(15,2) NOT NULL,
    "valorDesconto" numeric(15,2) NOT NULL DEFAULT '0',
    "valorFrete" numeric(15,2) NOT NULL DEFAULT '0',
    "valorSeguro" numeric(15,2) NOT NULL DEFAULT '0',
    "outrasDespesas" numeric(15,2) NOT NULL DEFAULT '0',
    "impostoICMS" jsonb,
    "impostoIPI" jsonb,
    "impostoPIS" jsonb,
    "impostoCOFINS" jsonb,
    "observacoes" text,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_nfe_itens" PRIMARY KEY ("id"),
    CONSTRAINT "FK_nfe_itens_nfeId" FOREIGN KEY ("nfeId") REFERENCES "nfe"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_nfe_itens_produtoId" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id")
);

CREATE TABLE IF NOT EXISTS "nfe_duplicatas" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "nfeId" uuid NOT NULL,
    "numero" character varying(15) NOT NULL,
    "dataVencimento" date NOT NULL,
    "valor" numeric(15,2) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_nfe_duplicatas" PRIMARY KEY ("id"),
    CONSTRAINT "FK_nfe_duplicatas_nfeId" FOREIGN KEY ("nfeId") REFERENCES "nfe"("id") ON DELETE CASCADE
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS "idx_cadastros_companyId" ON "cadastros" ("companyId");
CREATE INDEX IF NOT EXISTS "idx_produtos_companyId" ON "produtos" ("companyId");
CREATE INDEX IF NOT EXISTS "idx_natureza_operacao_companyId" ON "natureza_operacao" ("companyId");
CREATE INDEX IF NOT EXISTS "idx_pedidos_venda_companyId" ON "pedidos_venda" ("companyId");
CREATE INDEX IF NOT EXISTS "idx_pedidos_venda_clienteId" ON "pedidos_venda" ("clienteId");
CREATE INDEX IF NOT EXISTS "idx_pedidos_venda_status" ON "pedidos_venda" ("status");
CREATE INDEX IF NOT EXISTS "idx_orcamentos_companyId" ON "orcamentos" ("companyId");
CREATE INDEX IF NOT EXISTS "idx_orcamentos_clienteId" ON "orcamentos" ("clienteId");
CREATE INDEX IF NOT EXISTS "idx_orcamentos_status" ON "orcamentos" ("status");
CREATE INDEX IF NOT EXISTS "idx_configuracao_nfe_companyId" ON "configuracao_nfe" ("company_id");
