import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character'
  );

export const RequestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase().trim(),
});

export type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(10, 'Reset token is required'),
  password: passwordSchema,
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;
