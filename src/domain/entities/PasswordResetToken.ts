import { PasswordResetTokenId } from '../value-objects/PasswordResetTokenId';
import { UserId } from '../value-objects/UserId';

export interface PasswordResetTokenProps {
  id: PasswordResetTokenId;
  tokenHash: string;
  userId: UserId;
  expiresAt: Date;
  createdAt: Date;
}

export class PasswordResetToken {
  private readonly id: PasswordResetTokenId;
  private readonly tokenHash: string;
  private readonly userId: UserId;
  private readonly expiresAt: Date;
  private readonly createdAt: Date;

  private constructor(props: PasswordResetTokenProps) {
    this.id = props.id;
    this.tokenHash = props.tokenHash;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  public static create(props: {
    tokenHash: string;
    userId: UserId;
    expiresAt: Date;
  }): PasswordResetToken {
    if (!props.tokenHash || props.tokenHash.trim().length === 0) {
      throw new Error('Token hash cannot be empty');
    }

    return new PasswordResetToken({
      id: PasswordResetTokenId.create(),
      tokenHash: props.tokenHash,
      userId: props.userId,
      expiresAt: props.expiresAt,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: PasswordResetTokenProps): PasswordResetToken {
    return new PasswordResetToken(props);
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  public getId(): PasswordResetTokenId {
    return this.id;
  }

  public getTokenHash(): string {
    return this.tokenHash;
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public toJSON(): any {
    return {
      id: this.id.getValue(),
      tokenHash: this.tokenHash,
      userId: this.userId.getValue(),
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
    };
  }
}
