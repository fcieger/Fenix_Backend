import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fenix-jwt-secret-key-2024-super-secure',
    });
  }

  async validate(payload: any) {
    // O token pode ter userId ou sub
    const userId = payload.userId || payload.sub;
    
    if (!userId) {
      console.error('❌ JWT Strategy: Token sem userId ou sub');
      return null;
    }
    
    console.log('🔍 JWT Strategy: Validando usuário com ID:', userId);
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      console.error('❌ JWT Strategy: Usuário não encontrado com ID:', userId);
      return null;
    }
    
    console.log('✅ JWT Strategy: Usuário encontrado:', user.email);
    const { password: _, ...result } = user;
    
    // Usar companyId do payload se existir, senão usar primeira empresa do usuário
    const companyIdFromToken = payload.companyId;
    
    // Usar companyId real do usuário (primeira empresa se houver)
    if (result.companies && result.companies.length > 0) {
      (result as any).companyId = companyIdFromToken || result.companies[0].id;
      (result as any).activeCompanyId = companyIdFromToken || result.companies[0].id;
      (result as any).userId = result.id;
    } else {
      (result as any).companyId = companyIdFromToken || null;
      (result as any).activeCompanyId = companyIdFromToken || null;
      (result as any).userId = result.id;
    }
    
    return result;
  }
}
