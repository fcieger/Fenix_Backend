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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
        entities: [
          User,
          Company,
          Cadastro,
          Produto,
          UserAccessLog,
          NaturezaOperacao,
          ConfiguracaoImpostoEstado,
          PedidoVenda,
          PedidoVendaItem,
          PrazoPagamento,
          Certificado,
          ConfiguracaoNfe,
          Nfe,
          NfeItem,
          NfeDuplicata,
        ],
        synchronize: process.env.NODE_ENV !== 'production', // true local, false produção
        logging: process.env.NODE_ENV === 'development',
      }),
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
  ],
  controllers: [
    AppController,
    TestSimpleController,
    HealthController,
    SimpleHealthController,
    TestRoutesController,
  ],
  providers: [AppService],
})
export class AppModule {}
