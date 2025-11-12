import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CapitalGiro } from '../entities/capital-giro.entity';

@Injectable()
export class CreditoAtivoGuard implements CanActivate {
  constructor(
    @InjectRepository(CapitalGiro)
    private capitalGiroRepository: Repository<CapitalGiro>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new ForbiddenException('Usuário não autenticado ou empresa não identificada');
    }

    // Verificar se a empresa tem crédito ativo
    const capitalAtivo = await this.capitalGiroRepository.findOne({
      where: {
        empresaId: user.companyId,
        status: 'ativo',
      },
    });

    if (!capitalAtivo) {
      throw new ForbiddenException('Empresa não possui crédito ativo');
    }

    return true;
  }
}



