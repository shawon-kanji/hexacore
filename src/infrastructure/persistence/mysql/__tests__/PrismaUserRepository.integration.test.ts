import { PrismaUserRepository } from '../PrismaUserRepository';
import { UserFactory } from '../../../../__tests__/factories/UserFactory';
import { Email } from '../../../../domain/value-objects/Email';
import { UserId } from '../../../../domain/value-objects/UserId';
import { getPrismaClient, disconnectPrisma } from '../../../database/PrismaClient';
import { ConflictError, NotFoundError } from '../../../../shared/errors';

/**
 * Integration tests for PrismaUserRepository
 *
 * NOTE: These tests require a test database to be running.
 * Set up a test database and configure DATABASE_URL in your test environment.
 *
 * To run these tests:
 * 1. Create a test database
 * 2. Run: DATABASE_URL="your-test-db-url" yarn test:integration
 * 3. Or skip these tests by running: yarn test:unit
 */
describe('PrismaUserRepository Integration Tests', () => {
  let repository: PrismaUserRepository;
  let prisma: ReturnType<typeof getPrismaClient>;

  beforeAll(async () => {
    prisma = getPrismaClient();
    repository = new PrismaUserRepository();

    // Verify database connection
    await prisma.$connect();
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany({});
  });

  describe('save', () => {
    it('should save a user to the database', async () => {
      const user = UserFactory.createValidUser({
        name: 'Integration Test User',
        email: 'integration@example.com',
        age: 30,
      });

      await repository.save(user);

      const savedUser = await repository.findById(user.getId());
      expect(savedUser).not.toBeNull();
      expect(savedUser?.getName()).toBe('Integration Test User');
      expect(savedUser?.getEmail().getValue()).toBe('integration@example.com');
      expect(savedUser?.getAge()).toBe(30);
    });

    it('should throw ConflictError when saving duplicate email', async () => {
      const user1 = UserFactory.createValidUser({
        email: 'duplicate@example.com',
      });
      const user2 = UserFactory.createValidUser({
        email: 'duplicate@example.com',
      });

      await repository.save(user1);

      await expect(repository.save(user2)).rejects.toThrow(ConflictError);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const user = UserFactory.createValidUser();
      await repository.save(user);

      const foundUser = await repository.findById(user.getId());

      expect(foundUser).not.toBeNull();
      expect(foundUser?.getId().getValue()).toBe(user.getId().getValue());
    });

    it('should return null when user not found', async () => {
      const nonExistentId = UserId.fromString('non-existent-id');

      const foundUser = await repository.findById(nonExistentId);

      expect(foundUser).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = UserFactory.createValidUser({
        email: 'findme@example.com',
      });
      await repository.save(user);

      const foundUser = await repository.findByEmail(Email.create('findme@example.com'));

      expect(foundUser).not.toBeNull();
      expect(foundUser?.getEmail().getValue()).toBe('findme@example.com');
    });

    it('should return null when email not found', async () => {
      const foundUser = await repository.findByEmail(Email.create('notfound@example.com'));

      expect(foundUser).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users exist', async () => {
      const users = await repository.findAll();

      expect(users).toEqual([]);
    });

    it('should return all users ordered by createdAt desc', async () => {
      const users = UserFactory.createMultipleUsers(3);

      for (const user of users) {
        await repository.save(user);
        // Small delay to ensure different createdAt timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const foundUsers = await repository.findAll();

      expect(foundUsers).toHaveLength(3);
      // Verify order (most recent first)
      expect(foundUsers[0].getCreatedAt().getTime()).toBeGreaterThanOrEqual(
        foundUsers[1].getCreatedAt().getTime()
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = UserFactory.createValidUser({
        name: 'Original Name',
        email: 'original@example.com',
      });
      await repository.save(user);

      user.updateName('Updated Name');
      await repository.update(user);

      const updatedUser = await repository.findById(user.getId());
      expect(updatedUser?.getName()).toBe('Updated Name');
    });

    it('should throw NotFoundError when updating non-existent user', async () => {
      const user = UserFactory.createValidUser();

      await expect(repository.update(user)).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when updating to duplicate email', async () => {
      const user1 = UserFactory.createValidUser({
        email: 'user1@example.com',
      });
      const user2 = UserFactory.createValidUser({
        email: 'user2@example.com',
      });

      await repository.save(user1);
      await repository.save(user2);

      user2.updateEmail('user1@example.com');

      await expect(repository.update(user2)).rejects.toThrow(ConflictError);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = UserFactory.createValidUser();
      await repository.save(user);

      await repository.delete(user.getId());

      const foundUser = await repository.findById(user.getId());
      expect(foundUser).toBeNull();
    });

    it('should throw NotFoundError when deleting non-existent user', async () => {
      const nonExistentId = UserId.fromString('non-existent-id');

      await expect(repository.delete(nonExistentId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('exists', () => {
    it('should return true when user exists', async () => {
      const user = UserFactory.createValidUser();
      await repository.save(user);

      const exists = await repository.exists(user.getId());

      expect(exists).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      const nonExistentId = UserId.fromString('non-existent-id');

      const exists = await repository.exists(nonExistentId);

      expect(exists).toBe(false);
    });
  });
});
