import { Controller, Get } from '@nestjs/common';

@Controller('test-simple')
export class TestSimpleController {
  @Get()
  test() {
    return { message: 'Test simple working!' };
  }
}

















