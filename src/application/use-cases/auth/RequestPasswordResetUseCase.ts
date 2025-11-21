import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IPasswordResetTokenRepository } from '../../../domain/repositories/IPasswordResetTokenRepository';
import { PasswordResetToken } from '../../../domain/entities/PasswordResetToken';
import { Email } from '../../../domain/value-objects/Email';
import { RequestPasswordResetDTO } from '../../dto/PasswordResetDTO';
import {
  generatePasswordResetToken,
  getPasswordResetExpiryDate,
  hashPasswordResetToken,
} from '../../utils/passwordResetToken';

export interface RequestPasswordResetResult {
  resetToken: string | null;
  expiresAt: Date | null;
}

/**
 * Use Case: Request Password Reset
 */
export class RequestPasswordResetUseCase {
  constructor(
    private userRepository: IUserRepository,
    private mysqlPasswordResetTokenRepository: IPasswordResetTokenRepository,
    private mongoPasswordResetTokenRepository: IPasswordResetTokenRepository
  ) {}

  async execute(dto: RequestPasswordResetDTO): Promise<RequestPasswordResetResult> {
    const email = Email.create(dto.email);
    const user = await this.userRepository.findByEmail(email);

    // Do not reveal whether the user exists to avoid account enumeration
    if (!user) {
      return {
        resetToken: null,
        expiresAt: null,
      };
    }

    // Remove any previous reset tokens for this user
    await Promise.all([
      this.mysqlPasswordResetTokenRepository.deleteAllByUserId(user.getId()),
      this.mongoPasswordResetTokenRepository.deleteAllByUserId(user.getId()),
    ]);

    const rawToken = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = getPasswordResetExpiryDate();

    const passwordResetToken = PasswordResetToken.create({
      tokenHash,
      userId: user.getId(),
      expiresAt,
    });

    await Promise.all([
      this.mongoPasswordResetTokenRepository.save(passwordResetToken),
      this.mysqlPasswordResetTokenRepository.save(passwordResetToken),
    ]);

    return {
      resetToken: rawToken,
      expiresAt,
    };
  }
}
