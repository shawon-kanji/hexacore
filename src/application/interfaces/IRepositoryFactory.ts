import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../domain/repositories/IRefreshTokenRepository';
import { IPasswordResetTokenRepository } from '../../domain/repositories/IPasswordResetTokenRepository';

/**
 * Repository Factory Interface
 *
 * This interface lives in the APPLICATION layer (not Infrastructure).
 * Services depend on this abstraction, not on concrete implementations.
 *
 * Benefits:
 * - Application layer doesn't depend on Infrastructure
 * - Follows Dependency Inversion Principle
 * - Easy to test (create mock factory)
 * - Follows Uncle Bob's Clean Architecture
 *
 * The concrete implementation will be in Infrastructure layer.
 */
export interface IRepositoryFactory {
  /**
   * Create MySQL user repository instance
   */
  createMySQLUserRepository(): IUserRepository;

  /**
   * Create MongoDB user repository instance
   */
  createMongoDBUserRepository(): IUserRepository;

  /**
   * Create MySQL refresh token repository instance
   */
  createMySQLRefreshTokenRepository(): IRefreshTokenRepository;

  /**
   * Create MongoDB refresh token repository instance
   */
  createMongoDBRefreshTokenRepository(): IRefreshTokenRepository;

  /**
   * Create MySQL password reset token repository instance
   */
  createMySQLPasswordResetTokenRepository(): IPasswordResetTokenRepository;

  /**
   * Create MongoDB password reset token repository instance
   */
  createMongoDBPasswordResetTokenRepository(): IPasswordResetTokenRepository;
}
