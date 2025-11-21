import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../../domain/entities/RefreshToken';
import { UserId } from '../../../domain/value-objects/UserId';
import { RefreshTokenDTO } from '../../dto/AuthTokenDTO';
import { JwtUtil, JwtPayload } from '../../../infrastructure/utils/JwtUtil';
import { UnauthorizedError, NotFoundError } from '../../../shared/errors';
import { logger } from '../../../shared/utils/logger';

/**
 * Use Case: Refresh access token
 *
 * Handles token refresh with:
 * - Refresh token verification
 * - New access token generation
 * - Refresh token rotation (optional security enhancement)
 */
export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private mysqlTokenRepository: IRefreshTokenRepository,
    private mongoTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(dto: RefreshTokenDTO): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify the refresh token JWT
    let payload: JwtPayload;
    try {
      payload = JwtUtil.verifyRefreshToken(dto.refreshToken);
    } catch (error) {
      logger.error(error);
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Check if refresh token exists in database
    const storedToken = await this.mongoTokenRepository.findByToken(dto.refreshToken);

    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found or has been revoked');
    }

    // Check if token is expired
    if (storedToken.isExpired()) {
      // Clean up expired token
      await this.mongoTokenRepository.deleteByToken(dto.refreshToken);
      await this.mysqlTokenRepository.deleteByToken(dto.refreshToken);
      throw new UnauthorizedError('Refresh token has expired');
    }

    // Verify token belongs to the user in payload
    const userId = UserId.fromString(payload.userId);
    if (!storedToken.belongsToUser(userId)) {
      throw new UnauthorizedError('Token mismatch');
    }

    // Get user to ensure they still exist and get latest info
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate new access token
    const newPayload: JwtPayload = {
      userId: user.getId().getValue(),
      email: user.getEmail().getValue(),
      role: user.getRole().getValue(),
    };

    const newAccessToken = JwtUtil.generateAccessToken(newPayload);

    // Token rotation: Generate new refresh token and invalidate old one
    const newRefreshTokenString = JwtUtil.generateRefreshToken(newPayload);

    // Delete old refresh token
    await this.mongoTokenRepository.deleteByToken(dto.refreshToken);
    await this.mysqlTokenRepository.deleteByToken(dto.refreshToken);

    // Create and save new refresh token
    const newRefreshToken = RefreshToken.create({
      token: newRefreshTokenString,
      userId: user.getId(),
      expiresAt: JwtUtil.getRefreshTokenExpiryDate(),
    });

    await this.mongoTokenRepository.save(newRefreshToken);
    await this.mysqlTokenRepository.save(newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenString,
    };
  }
}
