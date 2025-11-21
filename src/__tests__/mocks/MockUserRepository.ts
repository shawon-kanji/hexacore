import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';

/**
 * Mock implementation of IUserRepository for testing
 * Stores users in-memory for isolated unit tests
 */
export class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.getId().getValue(), user);
  }

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.getValue()) || null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const users = Array.from(this.users.values());
    return users.find((u) => u.getEmail().getValue() === email.getValue()) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async update(user: User): Promise<void> {
    const id = user.getId().getValue();
    if (!this.users.has(id)) {
      throw new Error(`User with id ${id} not found`);
    }
    this.users.set(id, user);
  }

  async delete(id: UserId): Promise<void> {
    this.users.delete(id.getValue());
  }

  async exists(id: UserId): Promise<boolean> {
    return this.users.has(id.getValue());
  }

  /**
   * Test helper: Clear all users from the mock repository
   */
  clear(): void {
    this.users.clear();
  }

  /**
   * Test helper: Get the number of users in the repository
   */
  count(): number {
    return this.users.size;
  }

  /**
   * Test helper: Seed the repository with users
   */
  seed(users: User[]): void {
    users.forEach((user) => {
      this.users.set(user.getId().getValue(), user);
    });
  }
}
