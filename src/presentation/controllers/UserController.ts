import { Request, Response, NextFunction } from 'express';
import { UserProfileService } from '../../application/services/UserProfileService';
import { UserManagementService } from '../../application/services/UserManagementService';
import { ResponseHandler } from '../../shared/utils/response';

/**
 * User Controller
 *
 * Receives services via constructor injection (Dependency Injection).
 * Services are created in the composition root (Infrastructure layer).
 *
 * Uses standard response handlers and lets global error handler catch exceptions.
 *
 * Architecture:
 * Controller → Services (bounded contexts) → Use Cases → Repositories
 *
 * Benefits:
 * - Follows Dependency Inversion Principle
 * - Controller depends on service abstractions (could be interfaces)
 * - Easy to test (inject mock services)
 * - True Clean Architecture compliance
 * - Standard response structure
 */
export class UserController {
  constructor(
    private profileService: UserProfileService,
    private managementService: UserManagementService
  ) {}

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, age } = req.body;

      // Validation is handled by Zod middleware
      const user = await this.managementService.createUser({
        name,
        email,
        age,
      });

      ResponseHandler.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.profileService.getUserProfile(id);

      ResponseHandler.fetched(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.profileService.getAllUserProfiles();

      ResponseHandler.fetched(res, users, 'Users retrieved successfully', { count: users.length });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await this.managementService.updateUser(id, updateData);

      ResponseHandler.updated(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await this.managementService.deleteUser(id);

      ResponseHandler.deleted(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
