import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCreditoTables1731276000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Habilitar extensão uuid se ainda não estiver
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Tabela de Solicitações de Crédito
    await queryRunner.query(`
      CREATE TABLE solicitacoes_credito (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        empresa_id UUID NOT NULL,
        usuario_id UUID NOT NULL,
        
        -- Dados da Solicitação
        valor_solicitado DECIMAL(15,2) NOT NULL,
        finalidade TEXT NOT NULL,
        tipo_garantia VARCHAR(100),
        descricao_garantia TEXT,
        
        -- Dados Complementares
        faturamento_medio DECIMAL(15,2),
        tempo_atividade_anos INTEGER,
        numero_funcionarios INTEGER,
        possui_restricoes BOOLEAN DEFAULT false,
        observacoes TEXT,
        
        -- Status e Controle
        status VARCHAR(50) NOT NULL DEFAULT 'em_analise',
        motivo_reprovacao TEXT,
        data_aprovacao TIMESTAMP,
        data_reprovacao TIMESTAMP,
        aprovado_por UUID,
        
        -- Auditoria
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        
        CONSTRAINT fk_solicitacao_empresa FOREIGN KEY (empresa_id) REFERENCES companies(id),
        CONSTRAINT fk_solicitacao_usuario FOREIGN KEY (usuario_id) REFERENCES users(id),
        CONSTRAINT fk_solicitacao_aprovador FOREIGN KEY (aprovado_por) REFERENCES users(id)
      );
    `);

    // Tabela de Documentos
    await queryRunner.query(`
      CREATE TABLE documentos_credito (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        solicitacao_id UUID NOT NULL,
        
        -- Tipo de Documento
        tipo_documento VARCHAR(100) NOT NULL,
        
        -- Arquivo
        nome_arquivo VARCHAR(255) NOT NULL,
        caminho_arquivo TEXT NOT NULL,
        tamanho_bytes BIGINT,
        mime_type VARCHAR(100),
        
        -- Status
        status VARCHAR(50) DEFAULT 'pendente',
        observacoes TEXT,
        validado_por UUID,
        data_validacao TIMESTAMP,
        
        -- Auditoria
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        
        CONSTRAINT fk_documento_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_credito(id) ON DELETE CASCADE,
        CONSTRAINT fk_documento_validador FOREIGN KEY (validado_por) REFERENCES users(id)
      );
    `);

    // Tabela de Análise de Crédito
    await queryRunner.query(`
      CREATE TABLE analises_credito (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        solicitacao_id UUID NOT NULL,
        analista_id UUID NOT NULL,
        
        -- Score e Análise
        score_credito INTEGER,
        risco_classificacao VARCHAR(50),
        
        -- Análise Detalhada
        parecer_tecnico TEXT,
        valor_aprovado DECIMAL(15,2),
        taxa_juros DECIMAL(5,2),
        prazo_meses INTEGER,
        
        -- Condições
        condicoes_especiais TEXT,
        garantias_exigidas TEXT,
        
        -- Status
        status VARCHAR(50) NOT NULL,
        
        -- Auditoria
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_analise_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_credito(id),
        CONSTRAINT fk_analise_analista FOREIGN KEY (analista_id) REFERENCES users(id)
      );
    `);

    // Tabela de Propostas de Crédito
    await queryRunner.query(`
      CREATE TABLE propostas_credito (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        solicitacao_id UUID NOT NULL,
        empresa_id UUID NOT NULL,
        
        -- Dados da Proposta
        numero_proposta VARCHAR(50) UNIQUE NOT NULL,
        instituicao_financeira VARCHAR(200) NOT NULL,
        valor_aprovado DECIMAL(15,2) NOT NULL,
        taxa_juros DECIMAL(5,2) NOT NULL,
        taxa_intermediacao DECIMAL(5,2) NOT NULL,
        prazo_meses INTEGER NOT NULL,
        
        -- Cálculos
        valor_parcela DECIMAL(15,2),
        cet DECIMAL(5,2),
        iof DECIMAL(15,2),
        valor_total_pagar DECIMAL(15,2),
        observacoes TEXT,
        condicoes_gerais TEXT,
        
        -- Status da Proposta
        status VARCHAR(50) NOT NULL DEFAULT 'enviada',
        
        -- Aceite/Recusa
        data_aceite TIMESTAMP,
        data_recusa TIMESTAMP,
        motivo_recusa TEXT,
        ip_aceite VARCHAR(45),
        user_agent TEXT,
        
        -- Validade
        data_envio TIMESTAMP DEFAULT NOW(),
        data_expiracao TIMESTAMP,
        
        -- Controle
        enviada_por UUID,
        visualizada_em TIMESTAMP,
        
        -- Auditoria
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        
        CONSTRAINT fk_proposta_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_credito(id),
        CONSTRAINT fk_proposta_empresa FOREIGN KEY (empresa_id) REFERENCES companies(id),
        CONSTRAINT fk_proposta_enviada_por FOREIGN KEY (enviada_por) REFERENCES users(id)
      );
    `);

    // Tabela de Capital de Giro
    await queryRunner.query(`
      CREATE TABLE capital_giro (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        solicitacao_id UUID NOT NULL,
        empresa_id UUID NOT NULL,
        proposta_id UUID,
        
        -- Valores
        valor_liberado DECIMAL(15,2) NOT NULL,
        valor_utilizado DECIMAL(15,2) DEFAULT 0,
        limite_disponivel DECIMAL(15,2),
        
        -- Condições
        taxa_juros DECIMAL(5,2) NOT NULL,
        prazo_meses INTEGER NOT NULL,
        data_vencimento DATE,
        
        -- Status
        status VARCHAR(50) DEFAULT 'ativo',
        
        -- Auditoria
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        
        CONSTRAINT fk_capital_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_credito(id),
        CONSTRAINT fk_capital_empresa FOREIGN KEY (empresa_id) REFERENCES companies(id),
        CONSTRAINT fk_capital_proposta FOREIGN KEY (proposta_id) REFERENCES propostas_credito(id)
      );
    `);

    // Tabela de Antecipação de Recebíveis
    await queryRunner.query(`
      CREATE TABLE antecipacao_recebiveis (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        empresa_id UUID NOT NULL,
        solicitacao_id UUID,
        
        -- Valores
        valor_total_recebiveis DECIMAL(15,2) NOT NULL,
        valor_antecipado DECIMAL(15,2) NOT NULL,
        taxa_desconto DECIMAL(5,2) NOT NULL,
        valor_liquido DECIMAL(15,2) NOT NULL,
        
        -- Recebíveis
        quantidade_titulos INTEGER,
        data_vencimento_original DATE,
        data_antecipacao DATE DEFAULT NOW(),
        
        -- Status
        status VARCHAR(50) DEFAULT 'pendente',
        
        -- Auditoria
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP,
        
        CONSTRAINT fk_antecipacao_empresa FOREIGN KEY (empresa_id) REFERENCES companies(id),
        CONSTRAINT fk_antecipacao_solicitacao FOREIGN KEY (solicitacao_id) REFERENCES solicitacoes_credito(id)
      );
    `);

    // Tabela de Movimentações de Capital de Giro
    await queryRunner.query(`
      CREATE TABLE movimentacoes_capital_giro (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        capital_giro_id UUID NOT NULL,
        
        -- Movimentação
        tipo VARCHAR(50) NOT NULL,
        valor DECIMAL(15,2) NOT NULL,
        descricao TEXT,
        
        -- Saldo após movimentação
        saldo_anterior DECIMAL(15,2),
        saldo_posterior DECIMAL(15,2),
        
        -- Auditoria
        created_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_movimentacao_capital FOREIGN KEY (capital_giro_id) REFERENCES capital_giro(id)
      );
    `);

    // Tabela de Visualizações de Proposta
    await queryRunner.query(`
      CREATE TABLE visualizacoes_proposta (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        proposta_id UUID NOT NULL,
        usuario_id UUID,
        ip_address VARCHAR(45),
        user_agent TEXT,
        data_visualizacao TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_visualizacao_proposta FOREIGN KEY (proposta_id) REFERENCES propostas_credito(id),
        CONSTRAINT fk_visualizacao_usuario FOREIGN KEY (usuario_id) REFERENCES users(id)
      );
    `);

    // Índices para Performance
    await queryRunner.query(`CREATE INDEX idx_solicitacoes_empresa ON solicitacoes_credito(empresa_id)`);
    await queryRunner.query(`CREATE INDEX idx_solicitacoes_status ON solicitacoes_credito(status)`);
    await queryRunner.query(`CREATE INDEX idx_solicitacoes_usuario ON solicitacoes_credito(usuario_id)`);
    await queryRunner.query(`CREATE INDEX idx_documentos_solicitacao ON documentos_credito(solicitacao_id)`);
    await queryRunner.query(`CREATE INDEX idx_documentos_status ON documentos_credito(status)`);
    await queryRunner.query(`CREATE INDEX idx_propostas_empresa ON propostas_credito(empresa_id)`);
    await queryRunner.query(`CREATE INDEX idx_propostas_status ON propostas_credito(status)`);
    await queryRunner.query(`CREATE INDEX idx_propostas_numero ON propostas_credito(numero_proposta)`);
    await queryRunner.query(`CREATE INDEX idx_propostas_solicitacao ON propostas_credito(solicitacao_id)`);
    await queryRunner.query(`CREATE INDEX idx_capital_giro_empresa ON capital_giro(empresa_id)`);
    await queryRunner.query(`CREATE INDEX idx_capital_giro_status ON capital_giro(status)`);
    await queryRunner.query(`CREATE INDEX idx_antecipacao_empresa ON antecipacao_recebiveis(empresa_id)`);
    await queryRunner.query(`CREATE INDEX idx_antecipacao_status ON antecipacao_recebiveis(status)`);
    await queryRunner.query(`CREATE INDEX idx_movimentacoes_capital ON movimentacoes_capital_giro(capital_giro_id)`);
    await queryRunner.query(`CREATE INDEX idx_visualizacoes_proposta ON visualizacoes_proposta(proposta_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices
    await queryRunner.query(`DROP INDEX IF EXISTS idx_visualizacoes_proposta`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_movimentacoes_capital`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_antecipacao_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_antecipacao_empresa`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_capital_giro_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_capital_giro_empresa`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_propostas_solicitacao`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_propostas_numero`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_propostas_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_propostas_empresa`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_documentos_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_documentos_solicitacao`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_solicitacoes_usuario`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_solicitacoes_status`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_solicitacoes_empresa`);

    // Remover tabelas
    await queryRunner.query(`DROP TABLE IF EXISTS visualizacoes_proposta`);
    await queryRunner.query(`DROP TABLE IF EXISTS movimentacoes_capital_giro`);
    await queryRunner.query(`DROP TABLE IF EXISTS antecipacao_recebiveis`);
    await queryRunner.query(`DROP TABLE IF EXISTS capital_giro`);
    await queryRunner.query(`DROP TABLE IF EXISTS propostas_credito`);
    await queryRunner.query(`DROP TABLE IF EXISTS analises_credito`);
    await queryRunner.query(`DROP TABLE IF EXISTS documentos_credito`);
    await queryRunner.query(`DROP TABLE IF EXISTS solicitacoes_credito`);
  }
}




