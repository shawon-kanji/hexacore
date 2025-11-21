import { z } from 'zod';

/**
 * Schema for auth response containing tokens and user info
 */
export const AuthTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
  }),
});

/**
 * Inferred DTO type for auth tokens
 */
export type AuthTokenDTO = z.infer<typeof AuthTokenSchema>;

/**
 * Schema for refresh token request
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Inferred DTO type for refresh token request
 */
export type RefreshTokenDTO = z.infer<typeof RefreshTokenSchema>;
