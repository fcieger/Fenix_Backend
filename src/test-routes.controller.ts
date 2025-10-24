import { Controller, Get, Post } from '@nestjs/common';

@Controller('test-routes')
export class TestRoutesController {
  @Get()
  getTest() {
    return { message: 'Test routes working!', timestamp: new Date().toISOString() };
  }

  @Post()
  postTest() {
    return { message: 'POST test routes working!', timestamp: new Date().toISOString() };
  }
}
