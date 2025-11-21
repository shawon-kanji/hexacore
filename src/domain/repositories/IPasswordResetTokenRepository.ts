import { PasswordResetToken } from '../entities/PasswordResetToken';
import { PasswordResetTokenId } from '../value-objects/PasswordResetTokenId';
import { UserId } from '../value-objects/UserId';

export interface IPasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  deleteById(id: PasswordResetTokenId): Promise<void>;
  deleteAllByUserId(userId: UserId): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}
