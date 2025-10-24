import { Controller, Get } from '@nestjs/common';

@Controller('test-prazos')
export class TestController {
  @Get()
  test() {
    return { message: 'Prazos module is working!' };
  }
}
