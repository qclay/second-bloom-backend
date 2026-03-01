import { Injectable, OnModuleInit } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly register: promClient.Registry;

  readonly httpRequestDuration: promClient.Histogram<string>;
  readonly httpRequestTotal: promClient.Counter<string>;
  readonly httpRequestErrors: promClient.Counter<string>;
  readonly memoryUsage: promClient.Gauge<string>;

  constructor() {
    this.register = new promClient.Registry();
    promClient.collectDefaultMetrics({ register: this.register });

    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    this.httpRequestTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestErrors = new promClient.Counter({
      name: 'http_request_errors_total',
      help: 'Total number of HTTP request errors',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.memoryUsage = new promClient.Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [this.register],
    });
  }

  onModuleInit(): void {
    this.startMemoryMetrics();
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
  ): void {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
    };

    this.httpRequestDuration.observe(labels, duration / 1000);
    this.httpRequestTotal.inc(labels);

    if (statusCode >= 400) {
      this.httpRequestErrors.inc(labels);
    }
  }

  private startMemoryMetrics(): void {
    setInterval(() => {
      const usage = process.memoryUsage();
      this.memoryUsage.set({ type: 'heap_used' }, usage.heapUsed);
      this.memoryUsage.set({ type: 'heap_total' }, usage.heapTotal);
      this.memoryUsage.set({ type: 'external' }, usage.external);
      this.memoryUsage.set({ type: 'rss' }, usage.rss);
    }, 5000);
  }
}
