import pino from 'pino';

/**
 * Centralized Logger using Pino
 *
 * Provides structured logging with different log levels:
 * - trace: Very detailed technical information
 * - debug: Detailed debugging information
 * - info: General informational messages
 * - warn: Warning messages
 * - error: Error messages
 * - fatal: Fatal error messages
 *
 * Features:
 * - Structured JSON logging in production
 * - Pretty formatted logs in development
 * - Automatic timestamping
 * - Log levels configuration via environment
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

/**
 * Create a child logger with additional context
 *
 * @example
 * const dbLogger = createLogger({ module: 'database' });
 * dbLogger.info('Connected to MySQL');
 */
export const createLogger = (context: Record<string, any>) => {
  return logger.child(context);
};

/**
 * Log levels for reference:
 * - logger.trace('message', { details })  // Most verbose
 * - logger.debug('message', { details })  // Debug information
 * - logger.info('message', { details })   // General information
 * - logger.warn('message', { details })   // Warnings
 * - logger.error('message', { details })  // Errors
 * - logger.fatal('message', { details })  // Fatal errors
 */
