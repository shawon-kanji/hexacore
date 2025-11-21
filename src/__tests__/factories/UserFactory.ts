import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { Password } from '../../domain/value-objects/Password';
import { Role, UserRole } from '../../domain/value-objects/Role';

export class UserFactory {
  /**
   * Creates a valid User entity with default test data
   * Note: Password creation is async, so this method must be async
   */
  static async createValidUser(overrides?: {
    name?: string;
    email?: string;
    password?: Password;
    role?: Role;
    age?: number;
  }): Promise<User> {
    const password = overrides?.password || (await Password.create('TestPassword123!'));
    const role = overrides?.role || Role.fromEnum(UserRole.USER);

    return User.create({
      name: overrides?.name || 'John Doe',
      email: overrides?.email || 'john.doe@example.com',
      password,
      role,
      age: overrides?.age,
    });
  }

  /**
   * Reconstitutes a User with all properties (for testing repository responses)
   */
  static reconstitute(props?: {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    age?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const now = new Date();
    return User.reconstitute({
      id: UserId.fromString(props?.id || 'test-id-123'),
      name: props?.name || 'John Doe',
      email: Email.create(props?.email || 'john.doe@example.com'),
      password: Password.fromHash(
        props?.password || '$2b$10$hashedPasswordExample1234567890123456789'
      ),
      role: Role.create(props?.role || 'USER'),
      age: props?.age,
      createdAt: props?.createdAt || now,
      updatedAt: props?.updatedAt || now,
    });
  }

  /**
   * Creates multiple users for testing list operations
   */
  static async createMultipleUsers(count: number): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      const password = await Password.create('TestPassword123!');
      users.push(
        User.create({
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          password,
          role: Role.fromEnum(UserRole.USER),
          age: 20 + i,
        })
      );
    }
    return users;
  }
}
