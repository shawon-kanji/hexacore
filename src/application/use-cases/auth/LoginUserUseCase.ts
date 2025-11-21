import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../../domain/entities/RefreshToken';
import { Email } from '../../../domain/value-objects/Email';
import { LoginUserDTO } from '../../dto/LoginUserDTO';
import { AuthTokenDTO } from '../../dto/AuthTokenDTO';
import { JwtUtil, JwtPayload } from '../../../infrastructure/utils/JwtUtil';
import { UnauthorizedError } from '../../../shared/errors';

/**
 * Use Case: Login user
 *
 * Handles user authentication with:
 * - Email/password verification
 * - JWT token generation
 * - Refresh token creation
 */
export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private mysqlTokenRepository: IRefreshTokenRepository,
    private mongoTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(dto: LoginUserDTO): Promise<AuthTokenDTO> {
    // Find user by email
    const user = await this.userRepository.findByEmail(Email.create(dto.email));

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT tokens
    const payload: JwtPayload = {
      userId: user.getId().getValue(),
      email: user.getEmail().getValue(),
      role: user.getRole().getValue(),
    };

    const { accessToken, refreshToken: refreshTokenString } = JwtUtil.generateTokenPair(payload);

    // Create and save refresh token entity
    const refreshToken = RefreshToken.create({
      token: refreshTokenString,
      userId: user.getId(),
      expiresAt: JwtUtil.getRefreshTokenExpiryDate(),
    });

    await this.mongoTokenRepository.save(refreshToken);
    await this.mysqlTokenRepository.save(refreshToken);

    // Return auth response
    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user.getId().getValue(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        role: user.getRole().getValue(),
      },
    };
  }
}
