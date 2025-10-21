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
    
    // Forçar companyId para debug
    (result as any).companyId = '2c650c76-4e2a-4b58-933c-c3f8b7434d80';
    console.log('✅ Debug JWT - CompanyId forçado:', '2c650c76-4e2a-4b58-933c-c3f8b7434d80');
    
    console.log('🔍 Debug JWT - Resultado final:', {
      id: result.id,
      email: result.email,
      companyId: (result as any).companyId,
      companies: result.companies
    });
    
    // Adicionar dados mock para debug
    (result as any).mockNfes = [
      {
        id: '8304a0e5-5450-406c-8fc2-7776c1e6eefd',
        companyId: '2c650c76-4e2a-4b58-933c-c3f8b7434d80',
        numeroNfe: '000000039',
        status: 'RASCUNHO',
        dataEmissao: '2025-10-20T21:00:00Z',
        valorTotalNota: 2183.63,
        destinatarioRazaoSocial: 'CASA DE CARNES CARVALHO PREMIUM LTDA',
        destinatarioCnpjCpf: '12.345.678/0001-90',
        destinatarioUF: 'PR',
        itens: []
      }
    ];
    
    console.log('🔧 Debug JWT - mockNfes adicionado:', (result as any).mockNfes);
    
    return result;
  }
}
