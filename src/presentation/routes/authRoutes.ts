import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { createAuthService } from '../../infrastructure/config/serviceFactory';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * Auth Routes - Composition Root
 *
 * Wires authentication endpoints following Clean Architecture:
 *
 * 1. Create AuthService using factory function
 * 2. Inject service into AuthController
 * 3. Define routes
 *
 * Public routes (no authentication required):
 * - POST /register - Register new user
 * - POST /login - Login existing user
 * - POST /refresh - Refresh access token
 * - POST /logout-device - Logout from specific device
 *
 * Protected routes (authentication required):
 * - POST /logout - Logout from all devices
 * - GET /me - Get current user info
 */

// Composition Root: Wire dependencies together
const authService = createAuthService();
const authController = new AuthController(authService);

// Public routes (no authentication required)
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/forgot-password', (req, res, next) =>
  authController.requestPasswordReset(req, res, next)
);
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));
router.post('/logout-device', (req, res, next) => authController.logoutDevice(req, res, next));

// Protected routes (authentication required)
router.post('/logout', authMiddleware, (req, res, next) => authController.logout(req, res, next));
router.get('/me', authMiddleware, (req, res, next) =>
  authController.getCurrentUser(req, res, next)
);

export default router;
