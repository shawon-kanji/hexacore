import mongoose from 'mongoose';

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
      const uri =
        process.env.MONGODB_URI || 'mongodb://localhost:27017/hexacore';

      await mongoose.connect(uri);

      console.log('MongoDB connected successfully');

      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }

  public getConnection(): typeof mongoose {
    if (mongoose.connection.readyState === 0) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return mongoose;
  }
}
