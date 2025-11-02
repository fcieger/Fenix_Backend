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
import { CertificadosModule } from './certificados/certificados.module';
import { ConfiguracaoNfeModule } from './configuracao-nfe/configuracao-nfe.module';
import { NfeModule } from './nfe/nfe.module';
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
// Entidades adicionais - verifique se existem no projeto
// Se essas entidades não existirem, remova-as ou ajuste os imports
// import { ContaFinanceira } from './financeiro/contas-financeiras/entities/conta-financeira.entity';
// import { Orcamento } from './orcamentos/entities/orcamento.entity';
// import { OrcamentoItem } from './orcamentos/entities/orcamento-item.entity';
// import { FormaPagamento } from './formas-pagamento/entities/forma-pagamento.entity';
// import { LocalEstoque } from './estoque/entities/local-estoque.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const syncTables = process.env.SYNC_TABLES === 'true' || process.env.NODE_ENV !== 'production';
        // Neon requer SSL sempre, então configuramos SSL para todas as conexões
        const needsSsl = process.env.DATABASE_URL?.includes('neon.tech') || process.env.NODE_ENV === 'production';
        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          ssl: needsSsl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: syncTables, // true quando SYNC_TABLES=true ou em desenvolvimento
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
  ],
  controllers: [AppController, TestSimpleController],
  providers: [AppService],
})
export class AppModule {}