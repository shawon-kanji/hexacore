import { randomBytes, createHash } from 'crypto';

const TOKEN_BYTE_SIZE = 32;
const DEFAULT_EXPIRY_MINUTES = 30;

export const generatePasswordResetToken = (): string => {
  return randomBytes(TOKEN_BYTE_SIZE).toString('hex');
};

export const hashPasswordResetToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

export const getPasswordResetExpiryDate = (minutes: number = DEFAULT_EXPIRY_MINUTES): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
