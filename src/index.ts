import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Application, Request, Response } from 'express';
import { getPrismaClient, disconnectPrisma } from './infrastructure/database/PrismaClient';
import { MongoDBConnection } from './infrastructure/database/MongoDBConnection';
import userRoutes from './presentation/routes/userRoutes';
import { logger } from './shared/utils/logger';
import { errorHandler, notFoundHandler } from './presentation/middlewares/errorHandler';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'HexaCore API is running',
    databases: ['MySQL', 'MongoDB'],
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Initialize Prisma client (MySQL with ORM)
    const prisma = getPrismaClient();
    await prisma.$connect();
    logger.info('Prisma connected to MySQL successfully');

    // Connect to MongoDB
    const mongoConnection = MongoDBConnection.getInstance();
    await mongoConnection.connect();

    // Start Express server
    app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(
        {
          port: PORT,
          databases: ['MySQL (Prisma)', 'MongoDB'],
          environment: process.env.NODE_ENV || 'development',
        },
        'Server started successfully'
      );
      logger.info('='.repeat(50));
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  void (async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    await disconnectPrisma();
    await MongoDBConnection.getInstance().disconnect();
    process.exit(0);
  })();
});

process.on('SIGINT', () => {
  void (async () => {
    logger.info('SIGINT signal received: closing HTTP server');
    await disconnectPrisma();
    await MongoDBConnection.getInstance().disconnect();
    process.exit(0);
  })();
});

void startServer();
