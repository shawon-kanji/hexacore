import { v4 as uuidv4 } from 'uuid';

export class PasswordResetTokenId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(): PasswordResetTokenId {
    return new PasswordResetTokenId(uuidv4());
  }

  public static fromString(id: string): PasswordResetTokenId {
    if (!id || id.trim().length === 0) {
      throw new Error('PasswordResetTokenId cannot be empty');
    }
    return new PasswordResetTokenId(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: PasswordResetTokenId): boolean {
    return this.value === other.value;
  }
}
