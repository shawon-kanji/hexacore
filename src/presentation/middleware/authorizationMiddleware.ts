import { Request, Response, NextFunction } from 'express';
import { UserRole, Role } from '../../domain/value-objects/Role';

/**
 * Authorization Middleware (RBAC)
 *
 * Checks if authenticated user has required role(s)
 * Must be used AFTER authMiddleware
 */

/**
 * Require specific role(s) to access endpoint
 *
 * @param allowedRoles - Array of roles that can access this endpoint
 * @example requireRole(['ADMIN']) // Only admins
 * @example requireRole(['ADMIN', 'MODERATOR']) // Admins or moderators
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (should be set by authMiddleware)
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found in request. Ensure authMiddleware runs before requireRole.',
      });
      return;
    }

    // Check if user's role is in allowed roles
    const userRole = req.user.role;
    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Require minimum role level (hierarchical permissions)
 *
 * USER < MODERATOR < ADMIN
 *
 * @param minimumRole - Minimum role required
 * @example requireMinimumRole('MODERATOR') // Allows MODERATOR and ADMIN
 */
export function requireMinimumRole(minimumRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No user found in request. Ensure authMiddleware runs before requireMinimumRole.',
      });
      return;
    }

    const userRole = Role.create(req.user.role);
    const requiredRole = Role.create(minimumRole);

    if (!userRole.hasPermission(requiredRole.getValue())) {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: `Access denied. Minimum required role: ${minimumRole}`,
      });
      return;
    }

    next();
  };
}

/**
 * Require admin role
 * Convenience function for admin-only endpoints
 */
export function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

/**
 * Require admin or moderator role
 * Convenience function for staff-only endpoints
 */
export function requireStaff() {
  return requireRole([UserRole.ADMIN, UserRole.MODERATOR]);
}

/**
 * Require user to be accessing their own resource
 *
 * @param userIdParam - Name of the route parameter containing user ID
 * @example requireOwnership('userId') // Checks if req.params.userId === req.user.userId
 */
export function requireOwnership(userIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const resourceUserId = req.params[userIdParam];
    const requestingUserId = req.user.userId;

    if (resourceUserId !== requestingUserId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'You can only access your own resources',
      });
      return;
    }

    next();
  };
}

/**
 * Require ownership OR admin role
 * Allows users to access their own resources, or admins to access any resource
 */
export function requireOwnershipOrAdmin(userIdParam: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const resourceUserId = req.params[userIdParam];
    const requestingUserId = req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (resourceUserId !== requestingUserId && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'You can only access your own resources unless you are an admin',
      });
      return;
    }

    next();
  };
}
