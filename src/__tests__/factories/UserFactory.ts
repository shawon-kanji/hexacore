import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';

export class UserFactory {
  /**
   * Creates a valid User entity with default test data
   */
  static createValidUser(overrides?: {
    name?: string;
    email?: string;
    age?: number;
  }): User {
    return User.create({
      name: overrides?.name || 'John Doe',
      email: overrides?.email || 'john.doe@example.com',
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
    age?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): User {
    const now = new Date();
    return User.reconstitute({
      id: UserId.fromString(props?.id || 'test-id-123'),
      name: props?.name || 'John Doe',
      email: Email.create(props?.email || 'john.doe@example.com'),
      age: props?.age,
      createdAt: props?.createdAt || now,
      updatedAt: props?.updatedAt || now,
    });
  }

  /**
   * Creates multiple users for testing list operations
   */
  static createMultipleUsers(count: number): User[] {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(
        User.create({
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          age: 20 + i,
        })
      );
    }
    return users;
  }
}
