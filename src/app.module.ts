import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestSimpleController } from './test-simple.controller';
import { HealthController } from './health/health.controller';
import { SimpleHealthController } from './health/simple-health.controller';
import { TestRoutesController } from './test-routes.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { CadastrosModule } from './cadastros/cadastros.module';
import { ProdutosModule } from './produtos/produtos.module';
import { UserAccessLogsModule } from './user-access-logs/user-access-logs.module';
import { NaturezaOperacaoModule } from './natureza-operacao/natureza-operacao.module';
import { PedidosVendaModule } from './pedidos-venda/pedidos-venda.module';
import { ImpostosModule } from './impostos/impostos.module';
import { PrazosPagamentoModule } from './prazos-pagamento/prazos-pagamento.module';
import { CertificadosModule } from './certificados/certificados.module';
import { ConfiguracaoNfeModule } from './configuracao-nfe/configuracao-nfe.module';
import { NfeModule } from './nfe/nfe.module';
import { NfeIntegrationModule } from './nfe-integration/nfe-integration.module';
import { ContasFinanceirasModule } from './financeiro/contas-financeiras/contas-financeiras.module';
import { User } from './users/entities/user.entity';
import { Company } from './companies/entities/company.entity';
import { Cadastro } from './cadastros/entities/cadastro.entity';
import { Produto } from './produtos/entities/produto.entity';
import { UserAccessLog } from './user-access-logs/entities/user-access-log.entity';
import { NaturezaOperacao } from './natureza-operacao/entities/natureza-operacao.entity';
import { ConfiguracaoImpostoEstado } from './natureza-operacao/entities/configuracao-imposto-estado.entity';
import { PedidoVenda } from './pedidos-venda/entities/pedido-venda.entity';
import { PedidoVendaItem } from './pedidos-venda/entities/pedido-venda-item.entity';
import { PrazoPagamento } from './prazos-pagamento/entities/prazo-pagamento.entity';
import { Certificado } from './certificados/entities/certificado.entity';
import { ConfiguracaoNfe } from './configuracao-nfe/entities/configuracao-nfe.entity';
import { Nfe } from './nfe/entities/nfe.entity';
import { NfeItem } from './nfe/entities/nfe-item.entity';
import { NfeDuplicata } from './nfe/entities/nfe-duplicata.entity';
import { ContaFinanceira } from './financeiro/contas-financeiras/entities/conta-financeira.entity';
import { Orcamento } from './orcamentos/entities/orcamento.entity';
import { OrcamentoItem } from './orcamentos/entities/orcamento-item.entity';
import { FormaPagamento } from './formas-pagamento/entities/forma-pagamento.entity';
import { LocalEstoque } from './estoque/entities/local-estoque.entity';
import { OrcamentosModule } from './orcamentos/orcamentos.module';
import { InitDbModule } from './init-db/init-db.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          entities: [User, Company, Cadastro, Produto, UserAccessLog, NaturezaOperacao, ConfiguracaoImpostoEstado, PedidoVenda, PedidoVendaItem, PrazoPagamento, Certificado, ConfiguracaoNfe, Nfe, NfeItem, NfeDuplicata, ContaFinanceira, Orcamento, OrcamentoItem, FormaPagamento, LocalEstoque],
          migrations: isProduction ? ['dist/migrations/*.js'] : [], // Desabilitado em desenvolvimento
          migrationsRun: false, // Nunca executa migrations automaticamente
          synchronize: false,
          logging: !isProduction,
        };
      },
    }),
    AuthModule,
    UsersModule,
    CompaniesModule,
    CadastrosModule,
    ProdutosModule,
    UserAccessLogsModule,
    NaturezaOperacaoModule,
    PedidosVendaModule,
    ImpostosModule,
    PrazosPagamentoModule,
    CertificadosModule,
    ConfiguracaoNfeModule,
    NfeModule,
    NfeIntegrationModule,
    ContasFinanceirasModule,
    OrcamentosModule,
    InitDbModule,
  ],
  controllers: [AppController, TestSimpleController, HealthController, SimpleHealthController, TestRoutesController],
  providers: [AppService],
})
export class AppModule {}