import { Controller, Get } from '@nestjs/common';

@Controller('test-prazos')
export class TestPrazosController {
  @Get()
  test() {
    return { message: 'Test prazos working!' };
  }
}






