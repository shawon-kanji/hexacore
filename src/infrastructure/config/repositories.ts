/**
 * Repository Factory - Singleton instances
 *
 * Database connections should be reused across the application.
 * This factory ensures we only create one instance of each repository.
 */

import { MySQLUserRepository } from '../persistence/mysql/MySQLUserRepository';
import { MongoDBUserRepository } from '../persistence/mongodb/MongoDBUserRepository';

// Singleton instances
let mysqlUserRepository: MySQLUserRepository | null = null;
let mongoUserRepository: MongoDBUserRepository | null = null;

export function getMySQLUserRepository(): MySQLUserRepository {
  if (!mysqlUserRepository) {
    mysqlUserRepository = new MySQLUserRepository();
  }
  return mysqlUserRepository;
}

export function getMongoDBUserRepository(): MongoDBUserRepository {
  if (!mongoUserRepository) {
    mongoUserRepository = new MongoDBUserRepository();
  }
  return mongoUserRepository;
}
