import { IRepositoryFactory } from '../../application/interfaces/IRepositoryFactory';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { IPasswordResetTokenRepository } from '../../domain/repositories/IPasswordResetTokenRepository';
import {
  getMySQLUserRepository,
  getMongoDBUserRepository,
  getMySQLRefreshTokenRepository,
  getMongoDBRefreshTokenRepository,
  getMySQLPasswordResetTokenRepository,
  getMongoDBPasswordResetTokenRepository,
} from './repositories';

/**
 * Repository Factory Implementation
 *
 * This concrete implementation lives in the INFRASTRUCTURE layer.
 * It implements the IRepositoryFactory interface from the Application layer.
 *
 * Dependencies:
 * Infrastructure → Application (interface) ✅ Correct direction!
 *
 * This follows Uncle Bob's Dependency Inversion Principle:
 * - High-level modules (Application) define interfaces
 * - Low-level modules (Infrastructure) implement interfaces
 * - Dependencies point inward (Infrastructure → Application)
 */
export class RepositoryFactory implements IRepositoryFactory {
  /**
   * Create MySQL user repository instance
   * Returns singleton instance from repository factory
   */
  createMySQLUserRepository(): IUserRepository {
    return getMySQLUserRepository();
  }

  /**
   * Create MongoDB user repository instance
   * Returns singleton instance from repository factory
   */
  createMongoDBUserRepository(): IUserRepository {
    return getMongoDBUserRepository();
  }

  /**
   * Create MySQL refresh token repository instance
   * Returns singleton instance from repository factory
   */
  createMySQLRefreshTokenRepository(): IRefreshTokenRepository {
    return getMySQLRefreshTokenRepository();
  }

  /**
   * Create MongoDB refresh token repository instance
   * Returns singleton instance from repository factory
   */
  createMongoDBRefreshTokenRepository(): IRefreshTokenRepository {
    return getMongoDBRefreshTokenRepository();
  }

  createMySQLPasswordResetTokenRepository(): IPasswordResetTokenRepository {
    return getMySQLPasswordResetTokenRepository();
  }

  createMongoDBPasswordResetTokenRepository(): IPasswordResetTokenRepository {
    return getMongoDBPasswordResetTokenRepository();
  }
}
