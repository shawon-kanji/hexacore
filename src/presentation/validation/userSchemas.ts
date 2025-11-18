import { z } from 'zod';

/**
 * User Validation Schemas
 *
 * Zod schemas for validating user-related requests
 * These schemas will also be used to infer DTO types (Task 6)
 */

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email address'),
    age: z.number().int().positive('Age must be a positive number').optional(),
  }),
});

/**
 * Schema for updating a user
 */
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters')
        .optional(),
      email: z.string().email('Invalid email address').optional(),
      age: z.number().int().positive('Age must be a positive number').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

/**
 * Schema for getting a user by ID
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

/**
 * Schema for deleting a user
 */
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

/**
 * Schema for getting all users (with optional pagination query params)
 */
export const getAllUsersSchema = z.object({
  query: z
    .object({
      page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
      limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
    })
    .optional(),
});

// Type exports (will be used in Task 6)
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type GetAllUsersInput = z.infer<typeof getAllUsersSchema>;
