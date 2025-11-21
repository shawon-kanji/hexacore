import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { ResponseHandler } from '../../shared/utils/response';
import { RegisterUserSchema } from '../../application/dto/RegisterUserDTO';
import { LoginUserSchema } from '../../application/dto/LoginUserDTO';
import { RefreshTokenSchema } from '../../application/dto/AuthTokenDTO';
import {
  RequestPasswordResetSchema,
  ResetPasswordSchema,
} from '../../application/dto/PasswordResetDTO';

/**
 * Authentication Controller
 *
 * Handles authentication-related HTTP requests:
 * - User registration
 * - User login
 * - Token refresh
 * - User logout
 *
 * Receives AuthService via constructor injection.
 * Uses Zod schemas for request validation.
 * Returns standardized responses via ResponseHandler.
 *
 * Architecture:
 * AuthController → AuthService → Auth Use Cases → Repositories
 */
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body with Zod schema
      const validatedData = RegisterUserSchema.parse(req.body);

      // Register user and get tokens
      const authResponse = await this.authService.register(validatedData);

      ResponseHandler.created(res, authResponse, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login existing user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body with Zod schema
      const validatedData = LoginUserSchema.parse(req.body);

      // Authenticate user and get tokens
      const authResponse = await this.authService.login(validatedData);

      ResponseHandler.success(res, authResponse, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body with Zod schema
      const validatedData = RefreshTokenSchema.parse(req.body);

      // Refresh token
      const tokens = await this.authService.refreshToken(validatedData);

      ResponseHandler.success(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = RequestPasswordResetSchema.parse(req.body);
      const result = await this.authService.requestPasswordReset(validatedData);

      const responseData: Record<string, unknown> = {
        message: 'If an account exists for this email, password reset instructions have been sent.',
      };

      if (result.resetToken && process.env.NODE_ENV !== 'production') {
        responseData.resetToken = result.resetToken;
        responseData.expiresAt = result.expiresAt;
      }

      ResponseHandler.success(res, responseData, 'Password reset request received');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password using token
   * POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = ResetPasswordSchema.parse(req.body);
      await this.authService.resetPassword(validatedData);

      ResponseHandler.success(res, null, 'Password has been reset successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user (revoke all refresh tokens)
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User info attached by authMiddleware
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      await this.authService.logout(req.user.userId);

      ResponseHandler.success(res, null, 'Logged out successfully from all devices');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout from specific device (revoke single refresh token)
   * POST /api/auth/logout-device
   */
  async logoutDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = RefreshTokenSchema.parse(req.body);

      await this.authService.logoutDevice(validatedData.refreshToken);

      ResponseHandler.success(res, null, 'Logged out from this device successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // User info attached by authMiddleware
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      ResponseHandler.fetched(res, req.user, 'User info retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
