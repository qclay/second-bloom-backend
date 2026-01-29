import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status!: string;

  @ApiProperty({ example: '2026-01-29T12:00:00.000Z' })
  timestamp!: string;
}

export class HealthReadinessResponseDto {
  @ApiProperty({ example: 'ready' })
  status!: string;

  @ApiProperty({ example: '2026-01-29T12:00:00.000Z' })
  timestamp!: string;
}

export class HealthLivenessResponseDto {
  @ApiProperty({ example: 'alive' })
  status!: string;

  @ApiProperty({ example: '2026-01-29T12:00:00.000Z' })
  timestamp!: string;
}

export class HealthServiceStatusDto {
  @ApiProperty({ enum: ['ok', 'error'] })
  status!: string;

  @ApiPropertyOptional()
  responseTime?: number;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  connectionPool?: {
    activeConnections: number;
    idleConnections: number;
    totalConnections: number;
    maxConnections: number;
    utilization: number;
  };
}

export class HealthDetailedResponseDto {
  @ApiProperty({ enum: ['ok', 'error'] })
  status!: string;

  @ApiProperty()
  timestamp!: string;

  @ApiProperty()
  uptime!: number;

  @ApiProperty()
  version!: string;

  @ApiProperty()
  environment!: string;

  @ApiProperty({
    type: 'object',
    description: 'Database, Redis, AWS, SMS status',
    additionalProperties: { type: 'object' },
  })
  services!: Record<string, HealthServiceStatusDto>;

  @ApiProperty({ description: 'Memory usage in MB' })
  memory!: { used: number; total: number; percentage: number };

  @ApiPropertyOptional({ description: 'Disk space' })
  disk?: { free: number; total: number; percentage: number };
}

export class HealthWebSocketResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty()
  timestamp!: string;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      connections: { type: 'number' },
      rooms: { type: 'number' },
    },
  })
  chat?: { connections: number; rooms: number };

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      connections: { type: 'number' },
      rooms: { type: 'number' },
    },
  })
  auction?: { connections: number; rooms: number };

  @ApiPropertyOptional()
  metrics?: unknown;
}
