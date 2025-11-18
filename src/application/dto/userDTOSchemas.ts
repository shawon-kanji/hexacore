import { z } from 'zod';

/**
 * User DTO Schemas
 *
 * Zod schemas for DTOs (Data Transfer Objects).
 * These schemas define the shape of data returned from use cases.
 * Types are automatically inferred from these schemas.
 *
 * Benefits:
 * - Single source of truth for DTO structure
 * - Runtime validation capabilities
 * - Automatic type inference (no duplicate type definitions)
 */

/**
 * Schema for User DTO
 * Used for user data returned from use cases
 */
export const userDTOSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().positive().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Inferred UserDTO type from the Zod schema
 * This replaces the manual UserDTO interface
 */
export type UserDTO = z.infer<typeof userDTOSchema>;
