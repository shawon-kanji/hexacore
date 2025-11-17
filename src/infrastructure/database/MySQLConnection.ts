import mysql from 'mysql2/promise';

export class MySQLConnection {
  private static instance: MySQLConnection;
  private pool: mysql.Pool | null = null;

  private constructor() {}

  public static getInstance(): MySQLConnection {
    if (!MySQLConnection.instance) {
      MySQLConnection.instance = new MySQLConnection();
    }
    return MySQLConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'hexacore',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      console.log('MySQL connected successfully');
      connection.release();
    } catch (error) {
      console.error('MySQL connection error:', error);
      throw error;
    }
  }

  public getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('MySQL pool not initialized. Call connect() first.');
    }
    return this.pool;
  }

  public async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('MySQL disconnected');
    }
  }

  public async initializeSchema(): Promise<void> {
    const pool = this.getPool();

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        age INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    try {
      await pool.execute(createTableQuery);
      console.log('MySQL users table created or already exists');
    } catch (error) {
      console.error('Error creating MySQL table:', error);
      throw error;
    }
  }
}
