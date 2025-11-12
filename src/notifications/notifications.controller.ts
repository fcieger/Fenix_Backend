import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listar(@Request() req, @Query('limite') limite?: number) {
    return await this.notificationsService.listar(req.user.userId, limite);
  }

  @Get('nao-lidas')
  async contarNaoLidas(@Request() req) {
    const count = await this.notificationsService.contarNaoLidas(req.user.userId);
    return { count };
  }

  @Patch(':id/read')
  async marcarComoLida(@Request() req, @Param('id') id: string) {
    await this.notificationsService.marcarComoLida(id, req.user.userId);
    return { success: true };
  }

  @Post('read-all')
  async marcarTodasComoLidas(@Request() req) {
    await this.notificationsService.marcarTodasComoLidas(req.user.userId);
    return { success: true };
  }

  @Delete(':id')
  async excluir(@Request() req, @Param('id') id: string) {
    await this.notificationsService.excluir(id, req.user.userId);
    return { success: true };
  }
}

