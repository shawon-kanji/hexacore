import bcrypt from 'bcrypt';

export class Password {
  private readonly hashedValue: string;
  private static readonly SALT_ROUNDS = 10;
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  /**
   * Create a new Password from plain text (will be hashed)
   */
  public static async create(plainPassword: string): Promise<Password> {
    Password.validate(plainPassword);
    const hashed = await bcrypt.hash(plainPassword, Password.SALT_ROUNDS);
    return new Password(hashed);
  }

  /**
   * Reconstitute Password from already-hashed value (e.g., from database)
   */
  public static fromHash(hashedValue: string): Password {
    if (!hashedValue || hashedValue.trim().length === 0) {
      throw new Error('Hashed password cannot be empty');
    }
    return new Password(hashedValue);
  }

  /**
   * Validate plain password requirements
   */
  private static validate(plainPassword: string): void {
    if (!plainPassword) {
      throw new Error('Password cannot be empty');
    }

    if (plainPassword.length < Password.MIN_LENGTH) {
      throw new Error(`Password must be at least ${Password.MIN_LENGTH} characters long`);
    }

    if (plainPassword.length > Password.MAX_LENGTH) {
      throw new Error(`Password cannot exceed ${Password.MAX_LENGTH} characters`);
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(plainPassword)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(plainPassword)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    // Check for at least one number
    if (!/\d/.test(plainPassword)) {
      throw new Error('Password must contain at least one number');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(plainPassword)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  /**
   * Compare plain password with hashed password
   */
  public async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  /**
   * Get the hashed password value
   */
  public getValue(): string {
    return this.hashedValue;
  }
}
