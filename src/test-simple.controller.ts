import { Controller, Get } from '@nestjs/common';

@Controller('test-simple')
export class TestSimpleController {
  @Get()
  test(): { message: string } {
    return { message: 'Test simple controller working!' };
  }
}
