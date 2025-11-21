import { RefreshTokenId } from '../value-objects/RefreshTokenId';
import { UserId } from '../value-objects/UserId';

export interface RefreshTokenProps {
  id: RefreshTokenId;
  token: string;
  userId: UserId;
  expiresAt: Date;
  createdAt: Date;
}

export class RefreshToken {
  private readonly id: RefreshTokenId;
  private readonly token: string;
  private readonly userId: UserId;
  private readonly expiresAt: Date;
  private readonly createdAt: Date;

  private constructor(props: RefreshTokenProps) {
    this.id = props.id;
    this.token = props.token;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  public static create(props: { token: string; userId: UserId; expiresAt: Date }): RefreshToken {
    return new RefreshToken({
      id: RefreshTokenId.create(),
      token: props.token,
      userId: props.userId,
      expiresAt: props.expiresAt,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: RefreshTokenProps): RefreshToken {
    return new RefreshToken(props);
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  // Getters
  public getId(): RefreshTokenId {
    return this.id;
  }

  public getToken(): string {
    return this.token;
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
      token: this.token,
      userId: this.userId.getValue(),
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
    };
  }
}
