import { IPasswordResetTokenRepository } from '../../domain/repositories/IPasswordResetTokenRepository';
import { PasswordResetToken } from '../../domain/entities/PasswordResetToken';
import { PasswordResetTokenId } from '../../domain/value-objects/PasswordResetTokenId';
import { UserId } from '../../domain/value-objects/UserId';

export class MockPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  private tokens: Map<string, PasswordResetToken> = new Map();

  async save(token: PasswordResetToken): Promise<void> {
    this.tokens.set(token.getId().getValue(), token);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    for (const token of this.tokens.values()) {
      if (token.getTokenHash() === tokenHash) {
        return token;
      }
    }
    return null;
  }

  async deleteById(id: PasswordResetTokenId): Promise<void> {
    this.tokens.delete(id.getValue());
  }

  async deleteAllByUserId(userId: UserId): Promise<void> {
    for (const [tokenId, token] of this.tokens.entries()) {
      if (token.getUserId().equals(userId)) {
        this.tokens.delete(tokenId);
      }
    }
  }

  async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    for (const [tokenId, token] of this.tokens.entries()) {
      if (token.getExpiresAt() < now) {
        this.tokens.delete(tokenId);
      }
    }
  }

  clear(): void {
    this.tokens.clear();
  }

  count(): number {
    return this.tokens.size;
  }

  findAllByUserId(userId: UserId): PasswordResetToken[] {
    return Array.from(this.tokens.values()).filter((token) => token.getUserId().equals(userId));
  }
}
