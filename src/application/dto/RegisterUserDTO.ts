import { z } from 'zod';

/**
 * Zod schema for user registration
 * Validates password requirements and user input
 */
export const RegisterUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Password must contain at least one special character'
    ),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']).optional().default('USER'),
});

/**
 * Inferred DTO type from Zod schema
 * No need to manually define the interface
 */
export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
