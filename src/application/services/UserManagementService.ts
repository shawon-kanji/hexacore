import { IRepositoryFactory } from '../interfaces/IRepositoryFactory';
import { CreateUserUseCase } from '../use-cases/CreateUserUseCase';
import { UpdateUserUseCase } from '../use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../use-cases/DeleteUserUseCase';
import { CreateUserDTO } from '../dto/CreateUserDTO';
import { UpdateUserDTO } from '../dto/UpdateUserDTO';

/**
 * User Management Service
 *
 * Bounded Context: User Lifecycle Management
 *
 * This service:
 * - Groups user CRUD operations
 * - Depends on IRepositoryFactory interface (from Application layer)
 * - Creates use cases on-demand with repositories from factory
 * - NO dependencies on Infrastructure layer ✅
 *
 * Dependency Direction:
 * UserManagementService → IRepositoryFactory (interface in Application) ✅
 * Infrastructure → IRepositoryFactory (implements interface) ✅
 *
 * This follows Uncle Bob's Dependency Inversion Principle!
 */
export class UserManagementService {
  constructor(private repositoryFactory: IRepositoryFactory) {}

  /**
   * Create a new user
   */
  async createUser(data: CreateUserDTO) {
    // Get repositories from factory (dual-write pattern)
    const mysqlRepo = this.repositoryFactory.createMySQLUserRepository();
    const mongoRepo = this.repositoryFactory.createMongoDBUserRepository();

    // Create use case with both repositories
    const useCase = new CreateUserUseCase(mysqlRepo, mongoRepo);
    return useCase.execute(data);
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, data: UpdateUserDTO) {
    // Get repositories from factory (dual-write pattern)
    const mysqlRepo = this.repositoryFactory.createMySQLUserRepository();
    const mongoRepo = this.repositoryFactory.createMongoDBUserRepository();

    // Create use case with both repositories
    const useCase = new UpdateUserUseCase(mysqlRepo, mongoRepo);
    return useCase.execute(id, data);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string) {
    // Get repositories from factory (dual-write pattern)
    const mysqlRepo = this.repositoryFactory.createMySQLUserRepository();
    const mongoRepo = this.repositoryFactory.createMongoDBUserRepository();

    // Create use case with both repositories
    const useCase = new DeleteUserUseCase(mysqlRepo, mongoRepo);
    return useCase.execute(id);
  }
}
