import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestSimpleController } from './test-simple.controller';
import { HealthController } from './health/health.controller';
import { SimpleHealthController } from './health/simple-health.controller';
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
// Entities are now auto-loaded with autoLoadEntities: true

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
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
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
  controllers: [AppController, TestSimpleController, HealthController, SimpleHealthController],
  providers: [AppService],
})
export class AppModule {}