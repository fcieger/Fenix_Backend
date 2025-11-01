import { Controller, Post, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as pg from 'pg';

@Controller('api/init-db')
export class InitDbController {
  constructor(private dataSource: DataSource) {}

  @Post()
  async initializeDatabase() {
    try {
      console.log('🚀 Iniciando inicialização COMPLETA do banco de dados no backend...');

      // Obter conexão do TypeORM
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // Ler schema completo do diretório raiz do backend
      const schemaCompletoPath = join(process.cwd(), 'schema-completo.sql');
      let schemaCompleto: string;

      try {
        schemaCompleto = readFileSync(schemaCompletoPath, 'utf8');
        console.log('✅ Schema completo encontrado');
      } catch (error) {
        // Se não encontrar, tentar criar um schema básico
        console.warn('⚠️ Arquivo schema-completo.sql não encontrado, criando schema básico...');
        schemaCompleto = this.getBasicSchema();
      }

      // Dividir por ; e executar cada statement individualmente
      const statements = schemaCompleto.split(';').filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 0 && !trimmed.startsWith('--');
      });

      let executedStatements = 0;
      let skippedStatements = 0;
      const errors: string[] = [];

      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed.length > 0) {
          try {
            await queryRunner.query(trimmed);
            executedStatements++;
          } catch (err: any) {
            // Ignorar erros de tabelas já existentes ou constraints duplicadas
            if (
              err.message.includes('already exists') ||
              err.message.includes('duplicate') ||
              err.message.includes('relation already exists')
            ) {
              skippedStatements++;
            } else {
              errors.push(err.message.substring(0, 150));
              console.warn('⚠️ Erro ao executar statement:', err.message.substring(0, 150));
            }
          }
        }
      }

      // Verificar tabelas criadas
      const tablesResult = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const createdTables = tablesResult.map((row: any) => row.table_name);

      await queryRunner.release();

      console.log(`✅ Schema completo executado (${executedStatements} criados, ${skippedStatements} já existiam)`);

      return {
        success: true,
        message: 'Banco de dados inicializado COMPLETAMENTE com sucesso!',
        tablesCreated: createdTables.length,
        executedStatements,
        skippedStatements,
        errors: errors.length > 0 ? errors : undefined,
        tables: createdTables,
      };
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  @Get()
  async getTables() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const tablesResult = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      await queryRunner.release();

      return {
        success: true,
        tables: tablesResult.map((row: any) => row.table_name),
        count: tablesResult.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private getBasicSchema(): string {
    return `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      
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
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_companies (
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "companyId" UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        PRIMARY KEY ("userId", "companyId")
      );
    `;
  }
}

