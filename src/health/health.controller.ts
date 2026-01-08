import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { HealthService } from './health.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('Health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    const health = await this.healthService.checkHealth();
    return {
      status: health.status,
      timestamp: health.timestamp,
    };
  }

  @Get('detailed')
  @Public()
  @ApiOperation({ summary: 'Detailed health check with all services' })
  @ApiResponse({ status: 200, description: 'Detailed health status' })
  async detailed() {
    return this.healthService.checkHealth();
  }

  @Get('readiness')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Readiness probe - can app serve requests?' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readiness() {
    const health = await this.healthService.checkHealth();
    if (health.status === 'ok') {
      return { status: 'ready', timestamp: health.timestamp };
    }
    throw new Error('Service is not ready');
  }

  @Get('liveness')
  @Public()
  @ApiOperation({ summary: 'Liveness probe - is app running?' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
}
