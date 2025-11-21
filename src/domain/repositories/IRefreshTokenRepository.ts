import { RefreshToken } from '../entities/RefreshToken';
import { UserId } from '../value-objects/UserId';

export interface IRefreshTokenRepository {
  save(refreshToken: RefreshToken): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  deleteByToken(token: string): Promise<void>;
  deleteAllByUserId(userId: UserId): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}
