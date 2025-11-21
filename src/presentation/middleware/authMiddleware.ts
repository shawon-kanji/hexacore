import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../../infrastructure/utils/JwtUtil';
import { UserRole } from '../../domain/value-objects/Role';
import { logger } from '../../shared/utils/logger';

/**
 * Augment Express Request interface to include authenticated user info
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: UserRole;
    };
  }
}

/**
 * Authentication Middleware
 *
 * Verifies JWT access token from Authorization header
 * Attaches user info to request object if valid
 * Returns 401 if token is missing or invalid
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JwtUtil.verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message || 'Invalid or expired token',
    });
  }
}

/**
 * Optional authentication middleware
 *
 * Verifies token if present, but allows request to continue if not
 * Useful for endpoints that work differently for authenticated vs unauthenticated users
 */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = JwtUtil.verifyAccessToken(token);

      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }

    next();
  } catch (error) {
    logger.error(error);
    next();
  }
}
