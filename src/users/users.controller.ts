import {
  Controller,
  Get,
  Put,
  UseGuards,
  Request,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccessLogInterceptor } from '../user-access-logs/interceptors/access-log.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Adicionar campo lastLogin com data atual para teste
    const userWithLastLogin = {
      ...user,
      lastLogin: new Date().toISOString(),
    };

    // Remover a senha da resposta
    const { password, ...userWithoutPassword } = userWithLastLogin;
    return userWithoutPassword;
  }

  // @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateData: any) {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Atualizar apenas os campos permitidos
    const allowedFields = ['name', 'email', 'phone'];
    const updateFields = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }

    Object.assign(user, updateFields);
    const updatedUser = await this.usersService.save(user);

    // Remover a senha da resposta
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // @UseGuards(JwtAuthGuard)
  @Get('test-last-access')
  async testLastAccess(@Request() req) {
    return {
      message: 'Teste funcionando',
      timestamp: new Date().toISOString(),
    };
  }
}
