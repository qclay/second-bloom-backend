import { Controller, Get, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Public } from '../common/decorators/public.decorator';
import { HealthService } from './health.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto';
import { ChatGateway } from '../modules/chat/gateways/chat.gateway';
import { AuctionGateway } from '../modules/auction/gateways/auction.gateway';
import { WebSocketMetricsService } from '../common/services/websocket-metrics.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly healthService: HealthService,
    private readonly moduleRef: ModuleRef,
  ) {}

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
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
    type: ApiErrorResponseDto,
  })
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

  @Get('websocket')
  @Public()
  @ApiOperation({ summary: 'WebSocket health check' })
  @ApiResponse({ status: 200, description: 'WebSocket status' })
  websocket() {
    try {
      const response: {
        status: string;
        timestamp: string;
        chat?: {
          connections: number;
          rooms: number;
        };
        auction?: {
          connections: number;
          rooms: number;
        };
        metrics?: unknown;
      } = {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };

      try {
        const chatGateway = this.moduleRef.get(ChatGateway, { strict: false });
        if (chatGateway && chatGateway.server) {
          response.chat = {
            connections: chatGateway.getConnectionCount(),
            rooms: chatGateway.getRoomCount(),
          };
        }
      } catch {
        this.logger.error('ChatGateway not available');
      }

      try {
        const auctionGateway = this.moduleRef.get(AuctionGateway, {
          strict: false,
        });
        if (auctionGateway && auctionGateway.server) {
          response.auction = {
            connections: auctionGateway.getConnectionCount(),
            rooms: auctionGateway.getRoomCount(),
          };
        }
      } catch {
        this.logger.error('AuctionGateway not available');
      }

      try {
        const metricsService = this.moduleRef.get(WebSocketMetricsService, {
          strict: false,
        });
        if (metricsService) {
          response.metrics = metricsService.getMetrics();
        }
      } catch {
        this.logger.error('WebSocketMetricsService not available');
      }

      return response;
    } catch {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'WebSocket gateways not available',
      };
    }
  }
}
