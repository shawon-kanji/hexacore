import { IPasswordResetTokenRepository } from '../../../domain/repositories/IPasswordResetTokenRepository';
import { PasswordResetToken } from '../../../domain/entities/PasswordResetToken';
import { PasswordResetTokenId } from '../../../domain/value-objects/PasswordResetTokenId';
import { UserId } from '../../../domain/value-objects/UserId';
import { getPrismaClient } from '../../database/PrismaClient';

export class PrismaPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  private prisma = getPrismaClient();

  async save(token: PasswordResetToken): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: {
        id: token.getId().getValue(),
        tokenHash: token.getTokenHash(),
        userId: token.getUserId().getValue(),
        expiresAt: token.getExpiresAt(),
        createdAt: token.getCreatedAt(),
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record) {
      return null;
    }

    return this.mapToPasswordResetToken(record);
  }

  async deleteById(id: PasswordResetTokenId): Promise<void> {
    await this.prisma.passwordResetToken.delete({
      where: { id: id.getValue() },
    });
  }

  async deleteAllByUserId(userId: UserId): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: userId.getValue() },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private mapToPasswordResetToken(record: {
    id: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
  }): PasswordResetToken {
    return PasswordResetToken.reconstitute({
      id: PasswordResetTokenId.fromString(record.id),
      tokenHash: record.tokenHash,
      userId: UserId.fromString(record.userId),
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }
}
