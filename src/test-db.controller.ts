import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracaoNfe } from './configuracao-nfe/entities/configuracao-nfe.entity';

@Controller('test-db')
export class TestDbController {
  constructor(
    @InjectRepository(ConfiguracaoNfe)
    private readonly configuracaoNfeRepository: Repository<ConfiguracaoNfe>,
  ) {}

  @Get('configuracao-nfe')
  async testConfiguracaoNfe(): Promise<{ message: string; tableExists: boolean }> {
    try {
      const count = await this.configuracaoNfeRepository.count();
      return { message: 'Database test successful', tableExists: true };
    } catch (error) {
      return { message: `Database test failed: ${error.message}`, tableExists: false };
    }
  }
}

