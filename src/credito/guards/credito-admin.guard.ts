import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CreditoAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar se o usuário tem permissão de admin de crédito
    // TODO: Implementar verificação de roles/permissions
    // Por enquanto, vamos permitir qualquer usuário autenticado
    // Em produção, verificar se user.role === 'admin_credito' ou similar
    
    return true;
  }
}




