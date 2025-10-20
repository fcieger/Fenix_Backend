import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestSimpleController } from './test-simple.controller';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'fenix_user',
      password: process.env.DB_PASSWORD || 'fenix_password',
      database: process.env.DB_DATABASE || 'fenix_db',
      entities: [User, Company, Cadastro, Produto, UserAccessLog, NaturezaOperacao, ConfiguracaoImpostoEstado, PedidoVenda, PedidoVendaItem, PrazoPagamento],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
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
    CertificadoModule,
  ],
  controllers: [AppController, TestSimpleController],
  providers: [AppService],
})
export class AppModule {}