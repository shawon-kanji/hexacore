/**
 * Repository Factory - Singleton instances
 *
 * Database connections should be reused across the application.
 * This factory ensures we only create one instance of each repository.
 *
 * Updated to use Prisma ORM for MySQL instead of manual SQL queries.
 */

import { PrismaUserRepository } from '../persistence/mysql/PrismaUserRepository';
import { MongoDBUserRepository } from '../persistence/mongodb/MongoDBUserRepository';

// Singleton instances
let prismaUserRepository: PrismaUserRepository | null = null;
let mongoUserRepository: MongoDBUserRepository | null = null;

/**
 * Get MySQL User Repository (Prisma)
 * Uses Prisma ORM for type-safe database access
 */
export function getMySQLUserRepository(): PrismaUserRepository {
  if (!prismaUserRepository) {
    prismaUserRepository = new PrismaUserRepository();
  }
  return prismaUserRepository;
}

export function getMongoDBUserRepository(): MongoDBUserRepository {
  if (!mongoUserRepository) {
    mongoUserRepository = new MongoDBUserRepository();
  }
  return mongoUserRepository;
}
