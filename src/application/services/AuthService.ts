import { IRepositoryFactory } from '../interfaces/IRepositoryFactory';
import { RegisterUserUseCase } from '../use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../use-cases/auth/LoginUserUseCase';
import { RefreshTokenUseCase } from '../use-cases/auth/RefreshTokenUseCase';
import { LogoutUserUseCase } from '../use-cases/auth/LogoutUserUseCase';
import { RequestPasswordResetUseCase } from '../use-cases/auth/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../use-cases/auth/ResetPasswordUseCase';
import { RegisterUserDTO } from '../dto/RegisterUserDTO';
import { LoginUserDTO } from '../dto/LoginUserDTO';
import { RefreshTokenDTO, AuthTokenDTO } from '../dto/AuthTokenDTO';
import { RequestPasswordResetDTO, ResetPasswordDTO } from '../dto/PasswordResetDTO';

/**
 * Authentication Service
 *
 * Bounded Context: User Authentication & Authorization
 *
 * This service:
 * - Groups authentication-related operations
 * - Handles user registration, login, token refresh, and logout
 * - Depends on IRepositoryFactory interface (from Application layer)
 * - Creates use cases on-demand with repositories from factory
 * - NO dependencies on Infrastructure layer ✅
 *
 * Dependency Direction:
 * AuthService → IRepositoryFactory (interface in Application) ✅
 * Infrastructure → IRepositoryFactory (implements interface) ✅
 */
export class AuthService {
  constructor(private repositoryFactory: IRepositoryFactory) {}

  /**
   * Register a new user
   */
  async register(data: RegisterUserDTO): Promise<AuthTokenDTO> {
    const mysqlUserRepo = this.repositoryFactory.createMySQLUserRepository();
    const mongoUserRepo = this.repositoryFactory.createMongoDBUserRepository();
    const mysqlTokenRepo = this.repositoryFactory.createMySQLRefreshTokenRepository();
    const mongoTokenRepo = this.repositoryFactory.createMongoDBRefreshTokenRepository();

    const useCase = new RegisterUserUseCase(
      mysqlUserRepo,
      mongoUserRepo,
      mysqlTokenRepo,
      mongoTokenRepo
    );

    return useCase.execute(data);
  }

  /**
   * Login existing user
   */
  async login(data: LoginUserDTO): Promise<AuthTokenDTO> {
    // Use MongoDB for read (faster for auth queries)
    const userRepo = this.repositoryFactory.createMongoDBUserRepository();
    const mysqlTokenRepo = this.repositoryFactory.createMySQLRefreshTokenRepository();
    const mongoTokenRepo = this.repositoryFactory.createMongoDBRefreshTokenRepository();

    const useCase = new LoginUserUseCase(userRepo, mysqlTokenRepo, mongoTokenRepo);

    return useCase.execute(data);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    data: RefreshTokenDTO
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userRepo = this.repositoryFactory.createMongoDBUserRepository();
    const mysqlTokenRepo = this.repositoryFactory.createMySQLRefreshTokenRepository();
    const mongoTokenRepo = this.repositoryFactory.createMongoDBRefreshTokenRepository();

    const useCase = new RefreshTokenUseCase(userRepo, mysqlTokenRepo, mongoTokenRepo);

    return useCase.execute(data);
  }

  /**
   * Request password reset - generates token and stores it in dual databases
   */
  async requestPasswordReset(data: RequestPasswordResetDTO) {
    const userRepo = this.repositoryFactory.createMongoDBUserRepository();
    const mysqlTokenRepo = this.repositoryFactory.createMySQLPasswordResetTokenRepository();
    const mongoTokenRepo = this.repositoryFactory.createMongoDBPasswordResetTokenRepository();

    const useCase = new RequestPasswordResetUseCase(userRepo, mysqlTokenRepo, mongoTokenRepo);

    return useCase.execute(data);
  }

  /**
   * Reset password using a password reset token
   */
  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    const mysqlUserRepo = this.repositoryFactory.createMySQLUserRepository();
    const mongoUserRepo = this.repositoryFactory.createMongoDBUserRepository();
    const mysqlTokenRepo = this.repositoryFactory.createMySQLPasswordResetTokenRepository();
    const mongoTokenRepo = this.repositoryFactory.createMongoDBPasswordResetTokenRepository();

    const useCase = new ResetPasswordUseCase(
      mysqlUserRepo,
      mongoUserRepo,
      mysqlTokenRepo,
      mongoTokenRepo
    );

    return useCase.execute(data);
  }

  /**
   * Logout user (revoke all refresh tokens)
   */
  async logout(userId: string): Promise<void> {
    const mysqlTokenRepo = this.repositoryFactory.createMySQLRefreshTokenRepository();
    const mongoTokenRepo = this.repositoryFactory.createMongoDBRefreshTokenRepository();

    const useCase = new LogoutUserUseCase(mysqlTokenRepo, mongoTokenRepo);

    return useCase.execute(userId);
  }

  /**
   * Logout from specific device (revoke single refresh token)
   */
  async logoutDevice(refreshToken: string): Promise<void> {
    const mysqlTokenRepo = this.repositoryFactory.createMySQLRefreshTokenRepository();
    const mongoTokenRepo = this.repositoryFactory.createMongoDBRefreshTokenRepository();

    const useCase = new LogoutUserUseCase(mysqlTokenRepo, mongoTokenRepo);

    return useCase.executeWithToken(refreshToken);
  }
}
