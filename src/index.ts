import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Application, Request, Response } from 'express';
import { MySQLConnection } from './infrastructure/database/MySQLConnection';
import { MongoDBConnection } from './infrastructure/database/MongoDBConnection';
import userRoutes from './presentation/routes/userRoutes';

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

// Initialize database and start server
async function startServer() {
  try {
    // Connect to BOTH databases
    const mysqlConnection = MySQLConnection.getInstance();
    await mysqlConnection.connect();
    await mysqlConnection.initializeSchema();
    console.log('✓ Connected to MySQL and initialized schema');

    const mongoConnection = MongoDBConnection.getInstance();
    await mongoConnection.connect();
    console.log('✓ Connected to MongoDB');

    // Start Express server
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`Server is running on port ${PORT}`);
      console.log(`Using BOTH MySQL and MongoDB databases`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await MySQLConnection.getInstance().disconnect();
  await MongoDBConnection.getInstance().disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await MySQLConnection.getInstance().disconnect();
  await MongoDBConnection.getInstance().disconnect();
  process.exit(0);
});

startServer();
