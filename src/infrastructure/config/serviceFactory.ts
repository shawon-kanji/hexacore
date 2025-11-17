import { RepositoryFactory } from './RepositoryFactory';
import { UserProfileService } from '../../application/services/UserProfileService';
import { UserManagementService } from '../../application/services/UserManagementService';

/**
 * Service Factory (Composition Root)
 *
 * This is where the application is composed together.
 * Lives in Infrastructure layer because it creates concrete implementations.
 *
 * Responsibilities:
 * - Creates RepositoryFactory
 * - Injects factory into services
 * - Returns fully configured service instances
 *
 * This is the ONLY place where we wire concrete implementations together.
 * Uncle Bob calls this the "Composition Root" or "Main Component".
 */

/**
 * Create UserProfileService with all dependencies
 */
export function createUserProfileService(): UserProfileService {
  const repositoryFactory = new RepositoryFactory();
  return new UserProfileService(repositoryFactory);
}

/**
 * Create UserManagementService with all dependencies
 */
export function createUserManagementService(): UserManagementService {
  const repositoryFactory = new RepositoryFactory();
  return new UserManagementService(repositoryFactory);
}
