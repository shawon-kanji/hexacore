import { Request, Response } from 'express';
import { UserProfileService } from '../../application/services/UserProfileService';
import { UserManagementService } from '../../application/services/UserManagementService';

/**
 * User Controller
 *
 * Receives services via constructor injection (Dependency Injection).
 * Services are created in the composition root (Infrastructure layer).
 *
 * Architecture:
 * Controller → Services (bounded contexts) → Use Cases → Repositories
 *
 * Benefits:
 * - Follows Dependency Inversion Principle
 * - Controller depends on service abstractions (could be interfaces)
 * - Easy to test (inject mock services)
 * - True Clean Architecture compliance
 */
export class UserController {
  constructor(
    private profileService: UserProfileService,
    private managementService: UserManagementService
  ) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, age } = req.body;

      if (!name || !email) {
        res.status(400).json({
          success: false,
          message: 'Name and email are required',
        });
        return;
      }

      const user = await this.managementService.createUser({
        name,
        email,
        age,
      });

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.profileService.getUserProfile(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.profileService.getAllUserProfiles();

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const user = await this.managementService.updateUser(id, updateData);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.managementService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}
