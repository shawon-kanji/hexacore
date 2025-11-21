import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { User } from '../../../domain/entities/User';
import { RefreshToken } from '../../../domain/entities/RefreshToken';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { Role } from '../../../domain/value-objects/Role';
import { RegisterUserDTO } from '../../dto/RegisterUserDTO';
import { AuthTokenDTO } from '../../dto/AuthTokenDTO';
import { JwtUtil, JwtPayload } from '../../../infrastructure/utils/JwtUtil';
import { ConflictError } from '../../../shared/errors';

/**
 * Use Case: Register a new user
 *
 * Handles user registration with:
 * - Email uniqueness check
 * - Password hashing
 * - Dual-database persistence
 * - JWT token generation
 */
export class RegisterUserUseCase {
  constructor(
    private mysqlUserRepository: IUserRepository,
    private mongoUserRepository: IUserRepository,
    private mysqlTokenRepository: IRefreshTokenRepository,
    private mongoTokenRepository: IRefreshTokenRepository
  ) {}

  async execute(dto: RegisterUserDTO): Promise<AuthTokenDTO> {
    // Check if user with email already exists
    const existingUser = await this.mongoUserRepository.findByEmail(Email.create(dto.email));

    if (existingUser) {
      throw new ConflictError('User with this email already exists', { email: dto.email });
    }

    // Hash password (Password value object handles this)
    const hashedPassword = await Password.create(dto.password);

    // Create role (defaults to USER if not provided)
    const role = dto.role ? Role.create(dto.role) : Role.create('USER');

    // Create user entity (domain validation happens here)
    const user = User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: role,
      age: dto.age,
    });

    // Save user to BOTH databases (dual-write pattern)
    await this.mongoUserRepository.save(user);
    await this.mysqlUserRepository.save(user);

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
