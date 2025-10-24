import { Controller, Get } from '@nestjs/common';

@Controller('simple-health')
export class SimpleHealthController {
  @Get()
  getSimpleHealth() {
    return {
      status: 'ok',
      message: 'Simple health check working',
      timestamp: new Date().toISOString(),
    };
  }
}
