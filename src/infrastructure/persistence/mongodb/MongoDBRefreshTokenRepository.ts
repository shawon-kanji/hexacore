import { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository';
import { RefreshToken } from '../../../domain/entities/RefreshToken';
import { RefreshTokenId } from '../../../domain/value-objects/RefreshTokenId';
import { UserId } from '../../../domain/value-objects/UserId';
import { RefreshTokenModel, IRefreshTokenDocument } from './RefreshTokenSchema';

export class MongoDBRefreshTokenRepository implements IRefreshTokenRepository {
  async save(refreshToken: RefreshToken): Promise<void> {
    const tokenDocument = new RefreshTokenModel({
      _id: refreshToken.getId().getValue(),
      token: refreshToken.getToken(),
      userId: refreshToken.getUserId().getValue(),
      expiresAt: refreshToken.getExpiresAt(),
      createdAt: refreshToken.getCreatedAt(),
    });

    await tokenDocument.save();
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const document = await RefreshTokenModel.findOne({ token });

    if (!document) {
      return null;
    }

    return this.mapToRefreshToken(document);
  }

  async deleteByToken(token: string): Promise<void> {
    await RefreshTokenModel.deleteOne({ token });
  }

  async deleteAllByUserId(userId: UserId): Promise<void> {
    await RefreshTokenModel.deleteMany({ userId: userId.getValue() });
  }

  async deleteExpiredTokens(): Promise<void> {
    await RefreshTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  private mapToRefreshToken(document: IRefreshTokenDocument): RefreshToken {
    return RefreshToken.reconstitute({
      id: RefreshTokenId.fromString(document._id),
      token: document.token,
      userId: UserId.fromString(document.userId),
      expiresAt: new Date(document.expiresAt),
      createdAt: new Date(document.createdAt),
    });
  }
}
