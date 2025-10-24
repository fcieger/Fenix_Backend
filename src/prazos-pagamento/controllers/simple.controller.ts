import { Controller, Get } from '@nestjs/common';

@Controller('simple-prazos')
export class SimpleController {
  @Get()
  test() {
    return { message: 'Simple prazos working!' };
  }
}



















