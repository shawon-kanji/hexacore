import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { container } from '../../infrastructure/config/container';
import { TYPES } from '../../shared/types/Types';

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

// Create user
router.post('/', (req, res) => userController.createUser(req, res));

// Get all users
router.get('/', (req, res) => userController.getAllUsers(req, res));

// Get user by ID
router.get('/:id', (req, res) => userController.getUserById(req, res));

// Update user
router.put('/:id', (req, res) => userController.updateUser(req, res));

// Delete user
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

export default router;
