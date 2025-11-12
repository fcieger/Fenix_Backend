import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async criar(
    userId: string,
    tipo: string,
    titulo: string,
    mensagem: string,
    link?: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      tipo,
      titulo,
      mensagem,
      link,
    });

    return await this.notificationRepository.save(notification);
  }

  async listar(userId: string, limite?: number): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (limite) {
      query.limit(limite);
    }

    return await query.getMany();
  }

  async marcarComoLida(id: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id, userId },
      { lida: true, lidaEm: new Date() },
    );
  }

  async marcarTodasComoLidas(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, lida: false },
      { lida: true, lidaEm: new Date() },
    );
  }

  async contarNaoLidas(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, lida: false },
    });
  }

  async excluir(id: string, userId: string): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }

  // Métodos auxiliares para criar notificações específicas
  async notificarSolicitacaoCriada(userId: string, solicitacaoId: string, valor: number): Promise<void> {
    await this.criar(
      userId,
      'credito',
      'Nova Solicitação de Crédito',
      `Sua solicitação de ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi criada e está em análise.`,
      `/credito/minhas-solicitacoes/${solicitacaoId}`,
    );
  }

  async notificarPropostaEnviada(userId: string, propostaId: string, valor: number): Promise<void> {
    await this.criar(
      userId,
      'proposta',
      '🎉 Nova Proposta de Crédito!',
      `Você recebeu uma proposta de ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Acesse para visualizar.`,
      `/credito/proposta/${propostaId}`,
    );
  }

  async notificarPropostaAceita(adminUserId: string, propostaId: string, empresaNome: string): Promise<void> {
    await this.criar(
      adminUserId,
      'proposta_aceita',
      '✅ Proposta Aceita!',
      `A empresa ${empresaNome} aceitou a proposta. Ative o crédito agora.`,
      `/credito/admin/propostas`,
    );
  }

  async notificarAprovacao(userId: string, solicitacaoId: string): Promise<void> {
    await this.criar(
      userId,
      'aprovacao',
      '✅ Solicitação Aprovada!',
      'Sua solicitação de crédito foi aprovada. Em breve você receberá uma proposta.',
      `/credito/minhas-solicitacoes/${solicitacaoId}`,
    );
  }

  async notificarReprovacao(userId: string, solicitacaoId: string, motivo: string): Promise<void> {
    await this.criar(
      userId,
      'reprovacao',
      '❌ Solicitação Reprovada',
      `Sua solicitação foi reprovada. Motivo: ${motivo}`,
      `/credito/minhas-solicitacoes/${solicitacaoId}`,
    );
  }

  async notificarUtilizacaoCapital(empresaId: string, valor: number, limiteDisponivel: number): Promise<void> {
    await this.criar(
      empresaId,
      'capital_utilizado',
      '💰 Limite Utilizado',
      `Você utilizou ${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} do seu limite. Disponível: ${limiteDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      `/credito/capital-giro/extrato`,
    );
  }

  async notificarAntecipacaoSolicitada(userId: string, antecipacaoId: string, valorLiquido: number): Promise<void> {
    await this.criar(
      userId,
      'antecipacao_solicitada',
      '📊 Antecipação Solicitada',
      `Sua solicitação de antecipação de ${valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} foi recebida e está em análise.`,
      `/credito/antecipacao`,
    );
  }

  async notificarDocumentoValidado(userId: string, documentoNome: string): Promise<void> {
    await this.criar(
      userId,
      'documento_validado',
      '✅ Documento Aprovado',
      `O documento "${documentoNome}" foi aprovado.`,
      `/credito/documentacao`,
    );
  }

  async notificarDocumentoRejeitado(userId: string, documentoNome: string, motivo: string): Promise<void> {
    await this.criar(
      userId,
      'documento_rejeitado',
      '❌ Documento Rejeitado',
      `O documento "${documentoNome}" foi rejeitado. Motivo: ${motivo}`,
      `/credito/documentacao`,
    );
  }
}

