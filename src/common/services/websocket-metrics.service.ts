import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

interface WebSocketMetrics {
  totalConnections: number;
  totalDisconnections: number;
  activeConnections: number;
  messagesReceived: number;
  messagesSent: number;
  errors: number;
  averageLatency: number;
  peakConnections: number;
  peakConnectionsTimestamp?: Date;
}

@Injectable()
export class WebSocketMetricsService {
  private readonly logger = new Logger(WebSocketMetricsService.name);
  private metrics: WebSocketMetrics = {
    totalConnections: 0,
    totalDisconnections: 0,
    activeConnections: 0,
    messagesReceived: 0,
    messagesSent: 0,
    errors: 0,
    averageLatency: 0,
    peakConnections: 0,
  };

  private latencyMeasurements: number[] = [];
  private readonly maxLatencySamples = 1000;

  recordConnection(server: Server): void {
    this.metrics.totalConnections++;
    this.metrics.activeConnections = server.sockets.sockets.size;

    if (this.metrics.activeConnections > this.metrics.peakConnections) {
      this.metrics.peakConnections = this.metrics.activeConnections;
      this.metrics.peakConnectionsTimestamp = new Date();
    }
  }

  recordDisconnection(server: Server): void {
    this.metrics.totalDisconnections++;
    this.metrics.activeConnections = server.sockets.sockets.size;
  }

  recordMessageReceived(): void {
    this.metrics.messagesReceived++;
  }

  recordMessageSent(): void {
    this.metrics.messagesSent++;
  }

  recordError(): void {
    this.metrics.errors++;
  }

  recordLatency(latencyMs: number): void {
    this.latencyMeasurements.push(latencyMs);

    if (this.latencyMeasurements.length > this.maxLatencySamples) {
      this.latencyMeasurements.shift();
    }

    const sum = this.latencyMeasurements.reduce((a, b) => a + b, 0);
    this.metrics.averageLatency = sum / this.latencyMeasurements.length;
  }

  getMetrics(): WebSocketMetrics {
    return {
      ...this.metrics,
      averageLatency: Math.round(this.metrics.averageLatency * 100) / 100,
    };
  }

  getMetricsSnapshot(): {
    metrics: WebSocketMetrics;
    timestamp: string;
    uptime: number;
  } {
    return {
      metrics: this.getMetrics(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  reset(): void {
    this.metrics = {
      totalConnections: 0,
      totalDisconnections: 0,
      activeConnections: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0,
      averageLatency: 0,
      peakConnections: 0,
    };
    this.latencyMeasurements = [];
  }
}
