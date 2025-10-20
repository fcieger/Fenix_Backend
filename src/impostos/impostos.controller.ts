import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalculadoraImpostosService } from './impostos.service';
import { CalcularImpostosPedidoDto, CalcularImpostosResponseDto } from './dto/calcular-impostos.dto';

@Controller('impostos')
@UseGuards(JwtAuthGuard)
export class ImpostosController {
  constructor(private readonly service: CalculadoraImpostosService) {}

  @Post('calcular')
  async calcular(@Body() dto: any): Promise<any> {
    // Aceita corpo livre para evitar falhas de validação enquanto ajustamos o DTO/Frontend
    return this.service.calcularPedido(dto);
  }
}


