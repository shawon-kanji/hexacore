import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { UserId } from '../../../domain/value-objects/UserId';

/**
 * Use Case: Logout user
 *
 * Handles user logout by:
 * - Revoking all refresh tokens for the user
 * - Effectively invalidating all active sessions
 *
 * Note: Access tokens cannot be invalidated (they expire naturally)
 * For additional security, implement token blacklisting
 */
export class LogoutUserUseCase {
  constructor(
    private mysqlTokenRepository: IRefreshTokenRepository,
    private mongoTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const userIdVO = UserId.fromString(userId);

    // Delete all refresh tokens for this user (logout from all devices)
    await this.mongoTokenRepository.deleteAllByUserId(userIdVO);
    await this.mysqlTokenRepository.deleteAllByUserId(userIdVO);
  }

  /**
   * Logout from a specific device by revoking a single refresh token
   */
  async executeWithToken(refreshToken: string): Promise<void> {
    await this.mongoTokenRepository.deleteByToken(refreshToken);
    await this.mysqlTokenRepository.deleteByToken(refreshToken);
  }
}
