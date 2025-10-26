import { Controller, Get } from '@nestjs/common';

@Controller('test-routes')
export class TestRoutesController {
  @Get()
  test(): { message: string } {
    return { message: 'Test routes controller working!' };
  }
}
