// Node Modules
import winston from 'winston';

// Custom Modules
import config from '@/config';

// Winston configuration
const { combine, timestamp, json, errors, align, printf, colorize } =
  winston.format;

const transports: winston.transport[] = [];

// If the application is not running in production, add a console transport
if (config.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }), // Add colors to log levels
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss A' }), // Add timestamp to logs
        align(), // Align log messages
        printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? `\n${JSON.stringify(meta)}`
            : '';

          return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
        }),
      ),
    }),
  );
} else {
  // Production Transports
  // Write all logs with importance level of `error` or less to `error.log`
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), json()),
    }),
  );
  // Write all logs with importance level of `info` or less to `combined.log`
  transports.push(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), json()),
    }),
  );
}

// Create a logger instance using Winston
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info', // Set the default logging level to 'info'
  format: combine(timestamp(), errors({ stack: true }), json()), // Use JSON format for log messages
  defaultMeta: { service: 'blog-api' },
  // Define log transports (where logs should be saved)
  transports,
  silent: config.NODE_ENV === 'test', // Disable logging in test environment
});

export { logger };
