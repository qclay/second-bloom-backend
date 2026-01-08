import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
