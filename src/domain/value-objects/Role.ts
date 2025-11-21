export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export class Role {
  private readonly value: UserRole;

  private constructor(value: UserRole) {
    this.value = value;
  }

  public static create(value: string): Role {
    const upperValue = value.toUpperCase();

    if (!Object.values(UserRole).includes(upperValue as UserRole)) {
      throw new Error(
        `Invalid role: ${value}. Allowed roles: ${Object.values(UserRole).join(', ')}`
      );
    }

    return new Role(upperValue as UserRole);
  }

  public static fromEnum(role: UserRole): Role {
    return new Role(role);
  }

  public getValue(): UserRole {
    return this.value;
  }

  public isAdmin(): boolean {
    return this.value === UserRole.ADMIN;
  }

  public isModerator(): boolean {
    return this.value === UserRole.MODERATOR;
  }

  public isUser(): boolean {
    return this.value === UserRole.USER;
  }

  public hasPermission(requiredRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.USER]: 1,
      [UserRole.MODERATOR]: 2,
      [UserRole.ADMIN]: 3,
    };

    return roleHierarchy[this.value] >= roleHierarchy[requiredRole];
  }

  public equals(other: Role): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
