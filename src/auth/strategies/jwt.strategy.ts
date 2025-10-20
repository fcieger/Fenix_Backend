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
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      return null;
    }
    
    const { password: _, ...result } = user;
    
    // Adicionar companyId da primeira empresa do usuário
    if (result.companies && result.companies.length > 0) {
      (result as any).companyId = result.companies[0].id;
    }
    
    return result;
  }
}
