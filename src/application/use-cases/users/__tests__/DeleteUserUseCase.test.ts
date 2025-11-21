import { DeleteUserUseCase } from '../DeleteUserUseCase';
import { MockUserRepository } from '../../../../__tests__/mocks/MockUserRepository';
import { UserFactory } from '../../../../__tests__/factories/UserFactory';

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let mockMysqlRepository: MockUserRepository;
  let mockMongoRepository: MockUserRepository;

  beforeEach(() => {
    mockMysqlRepository = new MockUserRepository();
    mockMongoRepository = new MockUserRepository();
    deleteUserUseCase = new DeleteUserUseCase(mockMysqlRepository, mockMongoRepository);
  });

  afterEach(() => {
    mockMysqlRepository.clear();
    mockMongoRepository.clear();
  });

  describe('execute', () => {
    it('should delete user successfully', async () => {
      const user = UserFactory.reconstitute({
        id: 'user-to-delete',
        name: 'Test User',
        email: 'test@example.com',
      });
      await mockMysqlRepository.save(user);
      await mockMongoRepository.save(user);

      expect(mockMysqlRepository.count()).toBe(1);
      expect(mockMongoRepository.count()).toBe(1);

      await deleteUserUseCase.execute('user-to-delete');

      expect(mockMysqlRepository.count()).toBe(0);
      expect(mockMongoRepository.count()).toBe(0);
    });

    it('should delete from both MySQL and MongoDB repositories', async () => {
      const user = UserFactory.reconstitute({
        id: 'dual-delete-test',
        name: 'Dual Delete',
        email: 'dual@example.com',
      });
      await mockMysqlRepository.save(user);
      await mockMongoRepository.save(user);

      await deleteUserUseCase.execute('dual-delete-test');

      const mysqlExists = await mockMysqlRepository.exists(user.getId());
      const mongoExists = await mockMongoRepository.exists(user.getId());

      expect(mysqlExists).toBe(false);
      expect(mongoExists).toBe(false);
    });

    it('should throw error when user does not exist', async () => {
      await expect(deleteUserUseCase.execute('non-existent-id')).rejects.toThrow('User not found');

      expect(mockMysqlRepository.count()).toBe(0);
      expect(mockMongoRepository.count()).toBe(0);
    });

    it('should throw error for invalid UUID format', async () => {
      await expect(deleteUserUseCase.execute('invalid-uuid')).rejects.toThrow();
    });

    it('should not delete other users', async () => {
      const user1 = UserFactory.reconstitute({
        id: 'user-1',
        name: 'User 1',
        email: 'user1@example.com',
      });
      const user2 = UserFactory.reconstitute({
        id: 'user-2',
        name: 'User 2',
        email: 'user2@example.com',
      });
      const user3 = UserFactory.reconstitute({
        id: 'user-3',
        name: 'User 3',
        email: 'user3@example.com',
      });

      await mockMysqlRepository.save(user1);
      await mockMysqlRepository.save(user2);
      await mockMysqlRepository.save(user3);
      await mockMongoRepository.save(user1);
      await mockMongoRepository.save(user2);
      await mockMongoRepository.save(user3);

      expect(mockMysqlRepository.count()).toBe(3);
      expect(mockMongoRepository.count()).toBe(3);

      await deleteUserUseCase.execute('user-2');

      expect(mockMysqlRepository.count()).toBe(2);
      expect(mockMongoRepository.count()).toBe(2);

      const mysqlUser1Exists = await mockMysqlRepository.exists(user1.getId());
      const mysqlUser2Exists = await mockMysqlRepository.exists(user2.getId());
      const mysqlUser3Exists = await mockMysqlRepository.exists(user3.getId());

      expect(mysqlUser1Exists).toBe(true);
      expect(mysqlUser2Exists).toBe(false);
      expect(mysqlUser3Exists).toBe(true);
    });

    it('should handle multiple deletes', async () => {
      const users = await UserFactory.createMultipleUsers(5);

      // Save all users to both repositories
      for (const user of users) {
        await mockMysqlRepository.save(user);
        await mockMongoRepository.save(user);
      }

      const user1Id = users[0].getId().getValue();
      const user3Id = users[2].getId().getValue();

      await deleteUserUseCase.execute(user1Id);
      await deleteUserUseCase.execute(user3Id);

      const user1Exists = await mockMongoRepository.exists(users[0].getId());
      const user3Exists = await mockMongoRepository.exists(users[2].getId());

      expect(user1Exists).toBe(false);
      expect(user3Exists).toBe(false);
    });

    it('should not throw if attempting to verify deletion after delete', async () => {
      const user = UserFactory.reconstitute({
        id: 'verify-delete',
        name: 'Verify Delete',
        email: 'verify@example.com',
      });
      await mockMysqlRepository.save(user);
      await mockMongoRepository.save(user);

      await deleteUserUseCase.execute('verify-delete');

      const exists = await mockMongoRepository.exists(user.getId());
      expect(exists).toBe(false);
    });
  });
});
