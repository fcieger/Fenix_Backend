import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private companiesService: CompaniesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.usersService.validatePassword(user, password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        companies: user.companies,
      },
    };
  }

  async register(userData: any, companyData: any) {
    // Criar usuário
    const user = await this.usersService.create(userData);
    
    // Criar empresa
    const company = await this.companiesService.create(companyData, user);
    
    // Associar usuário à empresa e salvar
    user.companies = [company];
    await this.usersService.save(user);

    // Retornar dados do login
    const { password: _, ...userWithoutPassword } = user;
    return this.login(userWithoutPassword);
  }

  async validateToken(token: string) {
    const company = await this.companiesService.findByToken(token);
    if (!company) {
      throw new UnauthorizedException('Token inválido');
    }
    return company;
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.usersService.resetPasswordByEmail(email, newPassword);
    
    return {
      message: 'Senha resetada com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }
}
