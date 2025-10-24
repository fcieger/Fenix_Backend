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
      secretOrKey: 'fenix-jwt-secret-key-2024-super-secure',
    });
  }

  async validate(payload: any) {
    console.log('🔍 Debug JWT - Payload recebido:', payload);
    
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      console.log('❌ Debug JWT - Usuário não encontrado para ID:', payload.sub);
      return null;
    }
    
    console.log('🔍 Debug JWT - Usuário encontrado:', {
      id: user.id,
      email: user.email,
      companies: user.companies,
      companiesLength: user.companies?.length
    });
    
    const { password: _, ...result } = user;
    
    // Usar companyId real do usuário (primeira empresa se houver)
    if (result.companies && result.companies.length > 0) {
      (result as any).companyId = result.companies[0].id;
      (result as any).activeCompanyId = result.companies[0].id;
      console.log('✅ Debug JWT - CompanyId real:', result.companies[0].id);
    } else {
      console.log('⚠️ Debug JWT - Usuário sem empresas associadas');
      (result as any).companyId = null;
      (result as any).activeCompanyId = null;
    }
    
    console.log('🔍 Debug JWT - Resultado final:', {
      id: result.id,
      email: result.email,
      companyId: (result as any).companyId,
      companies: result.companies
    });
    
    return result;
  }
}
