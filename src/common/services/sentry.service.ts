import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const dsn = this.configService.get<string>('sentry.dsn');
    const enabled = this.configService.get<boolean>('sentry.enabled', false);
    const environment = this.configService.get<string>(
      'sentry.environment',
      'development',
    );
    const tracesSampleRate = this.configService.get<number>(
      'sentry.tracesSampleRate',
      1.0,
    );
    const profilesSampleRate = this.configService.get<number>(
      'sentry.profilesSampleRate',
      1.0,
    );

    if (!enabled || !dsn) {
      this.logger.warn('Sentry is not configured or disabled');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      integrations: [nodeProfilingIntegration()],
      tracesSampleRate,
      profilesSampleRate,
      beforeSend: (event) => {
        if (process.env.NODE_ENV === 'development') {
          this.logger.debug('Sentry Event', { event });
        }
        return event;
      },
    });

    this.logger.log('Sentry initialized successfully');
  }

  captureException(
    exception: unknown,
    context?: {
      requestId?: string;
      userId?: string;
      extra?: Record<string, unknown>;
    },
  ): string {
    if (!this.configService.get<boolean>('sentry.enabled', false)) {
      return '';
    }

    return Sentry.captureException(exception, {
      tags: {
        requestId: context?.requestId,
        userId: context?.userId,
      },
      extra: context?.extra,
    });
  }

  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: {
      requestId?: string;
      userId?: string;
      extra?: Record<string, unknown>;
    },
  ): string {
    if (!this.configService.get<boolean>('sentry.enabled', false)) {
      return '';
    }

    Sentry.captureMessage(message, {
      level,
      tags: {
        requestId: context?.requestId,
        userId: context?.userId,
      },
      extra: context?.extra,
    });

    return '';
  }
}
