import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { AlertaLicitacao } from '../entities/alerta-licitacao.entity';
import { Licitacao } from '../entities/licitacao.entity';

@Injectable()
export class NotifyAlertsJob {
  private readonly logger = new Logger(NotifyAlertsJob.name);

  constructor(
    @InjectRepository(AlertaLicitacao)
    private readonly alertaRepository: Repository<AlertaLicitacao>,
    @InjectRepository(Licitacao)
    private readonly licitacaoRepository: Repository<Licitacao>,
  ) {}

  /**
   * Executa a cada hora para verificar alertas em tempo real
   */
  @Cron(CronExpression.EVERY_HOUR)
  async verificarAlertasTempoReal() {
    this.logger.log('Verificando alertas em tempo real...');
    await this.processarAlertas('tempo_real');
  }

  /**
   * Executa diariamente às 9h
   */
  @Cron('0 9 * * *')
  async verificarAlertasDiarios() {
    this.logger.log('Verificando alertas diários...');
    await this.processarAlertas('diaria');
  }

  /**
   * Executa semanalmente às segundas-feiras às 9h
   */
  @Cron('0 9 * * 1')
  async verificarAlertasSemanais() {
    this.logger.log('Verificando alertas semanais...');
    await this.processarAlertas('semanal');
  }

  private async processarAlertas(frequencia: string) {
    try {
      const alertas = await this.alertaRepository.find({
        where: {
          ativo: true,
          frequencia,
        },
      });

      this.logger.log(`Encontrados ${alertas.length} alertas ativos (${frequencia})`);

      for (const alerta of alertas) {
        await this.processarAlerta(alerta);
      }
    } catch (error) {
      this.logger.error(`Erro ao processar alertas: ${error.message}`);
    }
  }

  private async processarAlerta(alerta: AlertaLicitacao) {
    try {
      this.logger.log(`Processando alerta: ${alerta.nome}`);

      // Construir query baseada nos critérios do alerta
      const query = this.licitacaoRepository.createQueryBuilder('licitacao');

      // Apenas abertas
      if (alerta.apenasAbertas) {
        query.andWhere('licitacao.status = :status', { status: 'Aberta' });
      }

      // Estados
      if (alerta.estados && alerta.estados.length > 0) {
        query.andWhere('licitacao.estado IN (:...estados)', {
          estados: alerta.estados,
        });
      }

      // Modalidades
      if (alerta.modalidades && alerta.modalidades.length > 0) {
        query.andWhere('licitacao.modalidade IN (:...modalidades)', {
          modalidades: alerta.modalidades,
        });
      }

      // Valor mínimo
      if (alerta.valorMinimo) {
        query.andWhere('licitacao.valorEstimado >= :valorMinimo', {
          valorMinimo: alerta.valorMinimo,
        });
      }

      // Valor máximo
      if (alerta.valorMaximo) {
        query.andWhere('licitacao.valorEstimado <= :valorMaximo', {
          valorMaximo: alerta.valorMaximo,
        });
      }

      // Palavras-chave
      if (alerta.palavrasChave && alerta.palavrasChave.length > 0) {
        const condicoes = alerta.palavrasChave.map(
          (palavra, index) =>
            `(licitacao.titulo ILIKE :palavra${index} OR licitacao.descricao ILIKE :palavra${index})`,
        );
        query.andWhere(`(${condicoes.join(' OR ')})`, {
          ...alerta.palavrasChave.reduce(
            (acc, palavra, index) => ({
              ...acc,
              [`palavra${index}`]: `%${palavra}%`,
            }),
            {},
          ),
        });
      }

      // Dias antes do encerramento
      if (alerta.diasAntesEncerramento) {
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() + alerta.diasAntesEncerramento);
        query.andWhere('licitacao.dataLimite <= :dataLimite', { dataLimite });
      }

      // Buscar apenas licitações novas (desde última notificação)
      if (alerta.ultimaNotificacao) {
        query.andWhere('licitacao.createdAt > :ultimaNotificacao', {
          ultimaNotificacao: alerta.ultimaNotificacao,
        });
      }

      const licitacoes = await query.take(50).getMany();

      if (licitacoes.length > 0) {
        this.logger.log(
          `Encontradas ${licitacoes.length} licitações para o alerta: ${alerta.nome}`,
        );

        // Enviar notificações
        if (alerta.notificarEmail) {
          await this.enviarEmailNotificacao(alerta, licitacoes);
        }

        // Atualizar última notificação
        await this.alertaRepository.update(alerta.id, {
          ultimaNotificacao: new Date(),
          totalNotificacoes: alerta.totalNotificacoes + 1,
        });
      }
    } catch (error) {
      this.logger.error(
        `Erro ao processar alerta ${alerta.id}: ${error.message}`,
      );
    }
  }

  private async enviarEmailNotificacao(
    alerta: AlertaLicitacao,
    licitacoes: Licitacao[],
  ) {
    // TODO: Integrar com serviço de email (SendGrid, etc)
    this.logger.log(
      `Enviando email para alerta "${alerta.nome}" com ${licitacoes.length} licitações`,
    );

    // Aqui você integraria com um serviço de email como:
    // - SendGrid
    // - AWS SES
    // - Nodemailer
    // etc.

    // Exemplo de estrutura do email:
    const emailContent = {
      to: alerta.userId, // TODO: Buscar email do usuário
      subject: `🔔 ${licitacoes.length} novas licitações - ${alerta.nome}`,
      html: this.gerarHTMLEmail(alerta, licitacoes),
    };

    this.logger.debug('Email content:', emailContent.subject);
  }

  private gerarHTMLEmail(
    alerta: AlertaLicitacao,
    licitacoes: Licitacao[],
  ): string {
    const formatCurrency = (valor: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    };

    const formatDate = (data: Date) => {
      return new Date(data).toLocaleDateString('pt-BR');
    };

    const licitacoesHTML = licitacoes
      .map(
        lic => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px;">
          <strong>${lic.titulo}</strong><br>
          <small style="color: #6b7280;">${lic.numeroProcesso}</small>
        </td>
        <td style="padding: 16px;">${lic.orgao}</td>
        <td style="padding: 16px;">${lic.estado}</td>
        <td style="padding: 16px;">${formatCurrency(lic.valorEstimado)}</td>
        <td style="padding: 16px;">${lic.dataLimite ? formatDate(lic.dataLimite) : 'N/A'}</td>
        <td style="padding: 16px;">
          <a href="http://localhost:3004/licitacoes/${lic.id}" 
             style="background: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Ver Detalhes
          </a>
        </td>
      </tr>
    `,
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Novas Licitações</title>
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: #2563eb; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Novas Licitações Disponíveis</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9;">Alerta: ${alerta.nome}</p>
          </div>

          <!-- Conteúdo -->
          <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px;">
              Encontramos <strong>${licitacoes.length} novas licitações</strong> que correspondem aos seus critérios:
            </p>

            <!-- Tabela de Licitações -->
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 12px; text-align: left;">Licitação</th>
                  <th style="padding: 12px; text-align: left;">Órgão</th>
                  <th style="padding: 12px; text-align: left;">Estado</th>
                  <th style="padding: 12px; text-align: left;">Valor</th>
                  <th style="padding: 12px; text-align: left;">Data Limite</th>
                  <th style="padding: 12px; text-align: left;">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${licitacoesHTML}
              </tbody>
            </table>

            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Este alerta foi enviado porque você está inscrito em "<strong>${alerta.nome}</strong>"
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">
                <a href="http://localhost:3004/licitacoes/alertas" style="color: #2563eb; text-decoration: none;">
                  Gerenciar meus alertas
                </a>
              </p>
            </div>
          </div>

          <!-- Footer da Empresa -->
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Fenix ERP - Sistema de Gestão Empresarial</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}



