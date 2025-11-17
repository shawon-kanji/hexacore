import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { UserService } from '../../application/services/UserService';
import { TYPES } from '../../shared/types/Types';

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private userService: UserService) {}

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

      const user = await this.userService.createUser({ name, email, age });

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

      const user = await this.userService.getUserById(id);

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
      const users = await this.userService.getAllUsers();

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

      const user = await this.userService.updateUser(id, updateData);

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

      await this.userService.deleteUser(id);

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
