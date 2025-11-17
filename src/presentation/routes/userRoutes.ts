import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import {
  createUserProfileService,
  createUserManagementService,
} from '../../infrastructure/config/serviceFactory';

const router = Router();

/**
 * User Routes - Composition Root
 *
 * This is where we wire everything together following Clean Architecture:
 *
 * 1. Create services using factory functions (from Infrastructure layer)
 * 2. Inject services into controller (Dependency Injection)
 * 3. Define routes
 *
 * Benefits:
 * - All dependencies point INWARD (Infrastructure → Application → Domain)
 * - Application layer never imports from Infrastructure
 * - Easy to test (create mock services for controller)
 * - Follows Uncle Bob's Clean Architecture
 *
 * To add a new feature:
 * 1. Create new use cases in Application layer
 * 2. Group them in a service (bounded context) in Application layer
 * 3. Add factory function in Infrastructure layer
 * 4. Inject service into controller here
 * 5. Add routes
 */

// Composition Root: Wire dependencies together
const profileService = createUserProfileService();
const managementService = createUserManagementService();
const userController = new UserController(profileService, managementService);

// Define routes
router.post('/', (req, res) => userController.createUser(req, res));
router.get('/', (req, res) => userController.getAllUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));
router.put('/:id', (req, res) => userController.updateUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

export default router;
