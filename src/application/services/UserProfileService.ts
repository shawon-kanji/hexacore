import { IRepositoryFactory } from '../interfaces/IRepositoryFactory';
import { GetUserByIdUseCase } from '../use-cases/GetUserByIdUseCase';
import { GetAllUsersUseCase } from '../use-cases/GetAllUsersUseCase';

/**
 * User Profile Service
 *
 * Bounded Context: User Profile Viewing
 *
 * This service:
 * - Groups profile-related READ operations
 * - Depends on IRepositoryFactory interface (from Application layer)
 * - Creates use cases on-demand with repositories from factory
 * - NO dependencies on Infrastructure layer ✅
 *
 * Dependency Direction:
 * UserProfileService → IRepositoryFactory (interface in Application) ✅
 * Infrastructure → IRepositoryFactory (implements interface) ✅
 *
 * This follows Uncle Bob's Dependency Inversion Principle!
 */
export class UserProfileService {
  constructor(private repositoryFactory: IRepositoryFactory) {}

  /**
   * Get a single user profile by ID
   */
  async getUserProfile(id: string) {
    // Get repository from factory
    const mongoRepo = this.repositoryFactory.createMongoDBUserRepository();

    // Create use case with repository
    const useCase = new GetUserByIdUseCase(mongoRepo);
    return useCase.execute(id);
  }

  /**
   * Get all user profiles
   */
  async getAllUserProfiles() {
    // Get repository from factory
    const mongoRepo = this.repositoryFactory.createMongoDBUserRepository();

    // Create use case with repository
    const useCase = new GetAllUsersUseCase(mongoRepo);
    return useCase.execute();
  }
}
