import { IUserRepository } from '../../domain/repositories/IUserRepository';

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
}
