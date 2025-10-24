import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      environment: process.env.NODE_ENV,
      database: !!process.env.DATABASE_URL,
      redis: !!process.env.REDIS_URL,
      timestamp: new Date().toISOString(),
    };
  }
}
