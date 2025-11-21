import { v4 as uuidv4 } from 'uuid';

export class RefreshTokenId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(): RefreshTokenId {
    return new RefreshTokenId(uuidv4());
  }

  public static fromString(id: string): RefreshTokenId {
    if (!id || id.trim().length === 0) {
      throw new Error('RefreshTokenId cannot be empty');
    }
    return new RefreshTokenId(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: RefreshTokenId): boolean {
    return this.value === other.value;
  }
}
