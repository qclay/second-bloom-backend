import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFormat = isProduction
  ? baseFormat
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString =
          Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
        return `${String(timestamp)} [${String(level)}]: ${String(message)} ${metaString}`;
      }),
    );

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      level: isProduction ? 'info' : 'debug',
      format: baseFormat,
      defaultMeta: {
        service: 'second-bloom-backend',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
      ],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
