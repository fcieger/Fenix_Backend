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
import { CreditoModule } from './credito/credito.module';
import { SolicitacaoCredito } from './credito/entities/solicitacao-credito.entity';
import { DocumentoCredito } from './credito/entities/documento-credito.entity';
import { AnaliseCredito } from './credito/entities/analise-credito.entity';
import { PropostaCredito } from './credito/entities/proposta-credito.entity';
import { CapitalGiro } from './credito/entities/capital-giro.entity';
import { MovimentacaoCapitalGiro } from './credito/entities/movimentacao-capital-giro.entity';
import { AntecipacaoRecebiveis } from './credito/entities/antecipacao-recebiveis.entity';
import { VisualizacaoProposta } from './credito/entities/visualizacao-proposta.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/entities/notification.entity';
import { ChatModule } from './chat/chat.module';
import { ChatMessage } from './chat/entities/chat-message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        
        // Se DATABASE_URL estiver definida, usar ela (Neon em produção)
        // Caso contrário, usar variáveis individuais (banco local em desenvolvimento)
        const config: any = {
          type: 'postgres',
          entities: [User, Company, Cadastro, Produto, UserAccessLog, NaturezaOperacao, ConfiguracaoImpostoEstado, PedidoVenda, PedidoVendaItem, PrazoPagamento, Certificado, ConfiguracaoNfe, Nfe, NfeItem, NfeDuplicata, ContaFinanceira, Orcamento, OrcamentoItem, FormaPagamento, LocalEstoque, SolicitacaoCredito, DocumentoCredito, AnaliseCredito, PropostaCredito, CapitalGiro, MovimentacaoCapitalGiro, AntecipacaoRecebiveis, VisualizacaoProposta, Notification, ChatMessage],
          migrations: isProduction ? ['dist/migrations/*.js'] : [],
          migrationsRun: false,
          synchronize: false,
          logging: !isProduction,
        };
        
        if (process.env.DATABASE_URL) {
          config.url = process.env.DATABASE_URL;
          config.ssl = isProduction ? { rejectUnauthorized: false } : false;
        } else {
          config.host = process.env.DB_HOST || 'localhost';
          config.port = parseInt(process.env.DB_PORT || '5432');
          config.username = process.env.DB_USERNAME || 'postgres';
          config.password = String(process.env.DB_PASSWORD || 'fenix123');
          config.database = process.env.DB_DATABASE || 'fenix';
        }
        
        return config;
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
    CreditoModule,
    NotificationsModule,
    ChatModule,
  ],
  controllers: [AppController, TestSimpleController, HealthController, SimpleHealthController, TestRoutesController],
  providers: [AppService],
})
export class AppModule {}