import { z } from 'zod';

/**
 * Zod schema for user login
 * Validates email and password input
 */
export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Inferred DTO type from Zod schema
 */
export type LoginUserDTO = z.infer<typeof LoginUserSchema>;
