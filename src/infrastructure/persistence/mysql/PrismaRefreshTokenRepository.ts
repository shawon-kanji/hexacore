import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../../domain/entities/RefreshToken';
import { RefreshTokenId } from '../../../domain/value-objects/RefreshTokenId';
import { UserId } from '../../../domain/value-objects/UserId';
import { getPrismaClient } from '../../database/PrismaClient';

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  private prisma = getPrismaClient();

  async save(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        id: refreshToken.getId().getValue(),
        token: refreshToken.getToken(),
        userId: refreshToken.getUserId().getValue(),
        expiresAt: refreshToken.getExpiresAt(),
        createdAt: refreshToken.getCreatedAt(),
      },
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!record) {
      return null;
    }

    return this.mapToRefreshToken(record);
  }

  async deleteByToken(token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.delete({
        where: { token },
      });
    } catch (error: any) {
      // Ignore if token doesn't exist (P2025)
      if (error.code === 'P2025') {
        return;
      }
      throw error;
    }
  }

  async deleteAllByUserId(userId: UserId): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId: userId.getValue() },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private mapToRefreshToken(record: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
  }): RefreshToken {
    return RefreshToken.reconstitute({
      id: RefreshTokenId.fromString(record.id),
      token: record.token,
      userId: UserId.fromString(record.userId),
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }
}
