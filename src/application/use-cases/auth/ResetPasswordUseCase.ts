import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordResetTokenRepository } from '../../../domain/repositories/IPasswordResetTokenRepository';
import { ResetPasswordDTO } from '../../dto/PasswordResetDTO';
import { hashPasswordResetToken } from '../../utils/passwordResetToken';
import { Password } from '../../../domain/value-objects/Password';
import { NotFoundError, UnauthorizedError } from '../../../shared/errors';
import { PasswordResetToken } from '../../../domain/entities/PasswordResetToken';

/**
 * Use Case: Reset Password using a password reset token
 */
export class ResetPasswordUseCase {
  constructor(
    private mysqlUserRepository: IUserRepository,
    private mongoUserRepository: IUserRepository,
    private mysqlPasswordResetTokenRepository: IPasswordResetTokenRepository,
    private mongoPasswordResetTokenRepository: IPasswordResetTokenRepository
  ) {}

  async execute(dto: ResetPasswordDTO): Promise<void> {
    const tokenHash = hashPasswordResetToken(dto.token);

    const passwordResetToken =
      (await this.mongoPasswordResetTokenRepository.findByTokenHash(tokenHash)) ||
      (await this.mysqlPasswordResetTokenRepository.findByTokenHash(tokenHash));

    if (!passwordResetToken) {
      throw new UnauthorizedError('Invalid or expired password reset token');
    }

    if (passwordResetToken.isExpired()) {
      await this.removeToken(passwordResetToken);
      throw new UnauthorizedError('Password reset token has expired');
    }

    const userId = passwordResetToken.getUserId();
    let user = await this.mongoUserRepository.findById(userId);

    if (!user) {
      user = await this.mysqlUserRepository.findById(userId);
    }

    if (!user) {
      await this.removeToken(passwordResetToken);
      throw new NotFoundError('User not found for this password reset request');
    }

    const newPassword = await Password.create(dto.password);
    await user.updatePassword(newPassword);

    await Promise.all([
      this.mongoUserRepository.update(user),
      this.mysqlUserRepository.update(user),
    ]);

    await this.removeToken(passwordResetToken);
  }

  private async removeToken(passwordResetToken: PasswordResetToken): Promise<void> {
    await Promise.all([
      this.mongoPasswordResetTokenRepository.deleteById(passwordResetToken.getId()),
      this.mysqlPasswordResetTokenRepository.deleteById(passwordResetToken.getId()),
    ]);
  }
}
