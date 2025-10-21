import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    console.log('🔐 JwtAuthGuard.canActivate - INÍCIO');
    
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    console.log('🔐 JwtAuthGuard.canActivate - isPublic:', isPublic);
    
    if (isPublic) {
      console.log('🔐 JwtAuthGuard.canActivate - Rota pública, permitindo acesso');
      return true;
    }
    
    console.log('🔐 JwtAuthGuard.canActivate - Rota protegida, validando JWT');
    const result = super.canActivate(context);
    console.log('🔐 JwtAuthGuard.canActivate - Resultado da validação:', result);
    return result;
  }
}
