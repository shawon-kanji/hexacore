import mongoose from 'mongoose';
import { createLogger } from '../../shared/utils/logger';

const logger = createLogger({ module: 'MongoDB' });

export class MongoDBConnection {
  private static instance: MongoDBConnection;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection();
    }
    return MongoDBConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hexacore';

      await mongoose.connect(uri);

      logger.info(
        {
          uri: uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'), // Hide password in logs
        },
        'MongoDB connected successfully'
      );

      mongoose.connection.on('error', (error) => {
        logger.error({ error }, 'MongoDB connection error');
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });
    } catch (error) {
      logger.error({ error }, 'MongoDB connection error');
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  }

  public getConnection(): typeof mongoose {
    if (mongoose.connection.readyState === 0) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return mongoose;
  }
}
