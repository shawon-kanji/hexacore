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
import { PrismaRefreshTokenRepository } from '../persistence/mysql/PrismaRefreshTokenRepository';
import { MongoDBRefreshTokenRepository } from '../persistence/mongodb/MongoDBRefreshTokenRepository';
import { PrismaPasswordResetTokenRepository } from '../persistence/mysql/PrismaPasswordResetTokenRepository';
import { MongoDBPasswordResetTokenRepository } from '../persistence/mongodb/MongoDBPasswordResetTokenRepository';

// Singleton instances
let prismaUserRepository: PrismaUserRepository | null = null;
let mongoUserRepository: MongoDBUserRepository | null = null;
let prismaRefreshTokenRepository: PrismaRefreshTokenRepository | null = null;
let mongoRefreshTokenRepository: MongoDBRefreshTokenRepository | null = null;
let prismaPasswordResetTokenRepository: PrismaPasswordResetTokenRepository | null = null;
let mongoPasswordResetTokenRepository: MongoDBPasswordResetTokenRepository | null = null;

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

/**
 * Get MySQL RefreshToken Repository (Prisma)
 */
export function getMySQLRefreshTokenRepository(): PrismaRefreshTokenRepository {
  if (!prismaRefreshTokenRepository) {
    prismaRefreshTokenRepository = new PrismaRefreshTokenRepository();
  }
  return prismaRefreshTokenRepository;
}

/**
 * Get MongoDB RefreshToken Repository
 */
export function getMongoDBRefreshTokenRepository(): MongoDBRefreshTokenRepository {
  if (!mongoRefreshTokenRepository) {
    mongoRefreshTokenRepository = new MongoDBRefreshTokenRepository();
  }
  return mongoRefreshTokenRepository;
}

/**
 * Get MySQL PasswordResetToken Repository (Prisma)
 */
export function getMySQLPasswordResetTokenRepository(): PrismaPasswordResetTokenRepository {
  if (!prismaPasswordResetTokenRepository) {
    prismaPasswordResetTokenRepository = new PrismaPasswordResetTokenRepository();
  }
  return prismaPasswordResetTokenRepository;
}

/**
 * Get MongoDB PasswordResetToken Repository
 */
export function getMongoDBPasswordResetTokenRepository(): MongoDBPasswordResetTokenRepository {
  if (!mongoPasswordResetTokenRepository) {
    mongoPasswordResetTokenRepository = new MongoDBPasswordResetTokenRepository();
  }
  return mongoPasswordResetTokenRepository;
}
