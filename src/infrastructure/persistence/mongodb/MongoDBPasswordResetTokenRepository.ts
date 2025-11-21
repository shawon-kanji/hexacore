import { IPasswordResetTokenRepository } from '../../../domain/repositories/IPasswordResetTokenRepository';
import { PasswordResetToken } from '../../../domain/entities/PasswordResetToken';
import { PasswordResetTokenId } from '../../../domain/value-objects/PasswordResetTokenId';
import { UserId } from '../../../domain/value-objects/UserId';
import {
  PasswordResetTokenModel,
  IPasswordResetTokenDocument,
} from './PasswordResetTokenSchema';

export class MongoDBPasswordResetTokenRepository implements IPasswordResetTokenRepository {
  async save(token: PasswordResetToken): Promise<void> {
    const document = new PasswordResetTokenModel({
      _id: token.getId().getValue(),
      tokenHash: token.getTokenHash(),
      userId: token.getUserId().getValue(),
      expiresAt: token.getExpiresAt(),
      createdAt: token.getCreatedAt(),
    });

    await document.save();
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const document = await PasswordResetTokenModel.findOne({ tokenHash });
    if (!document) {
      return null;
    }

    return this.mapToPasswordResetToken(document);
  }

  async deleteById(id: PasswordResetTokenId): Promise<void> {
    await PasswordResetTokenModel.deleteOne({ _id: id.getValue() });
  }

  async deleteAllByUserId(userId: UserId): Promise<void> {
    await PasswordResetTokenModel.deleteMany({ userId: userId.getValue() });
  }

  async deleteExpiredTokens(): Promise<void> {
    await PasswordResetTokenModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  private mapToPasswordResetToken(document: IPasswordResetTokenDocument): PasswordResetToken {
    return PasswordResetToken.reconstitute({
      id: PasswordResetTokenId.fromString(document._id),
      tokenHash: document.tokenHash,
      userId: UserId.fromString(document.userId),
      expiresAt: new Date(document.expiresAt),
      createdAt: new Date(document.createdAt),
    });
  }
}
