import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  @Public()
  root() {
    return {
      status: 'ok',
      message: 'Second Bloom API',
      timestamp: new Date().toISOString(),
      docs: '/api/v1/docs',
    };
  }
}
