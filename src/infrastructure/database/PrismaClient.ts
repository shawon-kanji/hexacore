import { PrismaClient } from '@prisma/client';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger({ module: 'Prisma' });

/**
 * Prisma Client Singleton
 *
 * Ensures a single instance of PrismaClient is used throughout the application.
 * This prevents creating multiple database connections.
 *
 * Benefits:
 * - Connection pooling handled by Prisma
 * - Type-safe database queries
 * - Automatic migrations
 * - Better performance than manual SQL
 */

let prisma: PrismaClient;

export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query' as never, (e: any) => {
        logger.debug(
          { query: e.query, params: e.params, duration: e.duration },
          'Prisma query executed'
        );
      });
    }

    prisma.$on('error' as never, (e: any) => {
      logger.error({ error: e }, 'Prisma error');
    });

    prisma.$on('warn' as never, (e: any) => {
      logger.warn({ warning: e }, 'Prisma warning');
    });

    logger.info('Prisma Client initialized');
  }

  return prisma;
};

/**
 * Disconnect Prisma Client
 * Call this during graceful shutdown
 */
export const disconnectPrisma = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Prisma Client disconnected');
  }
};
