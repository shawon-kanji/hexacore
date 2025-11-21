import { GetAllUsersUseCase } from '../GetAllUsersUseCase';
import { MockUserRepository } from '../../../../__tests__/mocks/MockUserRepository';
import { UserFactory } from '../../../../__tests__/factories/UserFactory';

describe('GetAllUsersUseCase', () => {
  let getAllUsersUseCase: GetAllUsersUseCase;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    getAllUsersUseCase = new GetAllUsersUseCase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe('execute', () => {
    it('should return empty array when no users exist', async () => {
      const result = await getAllUsersUseCase.execute();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should return all users', async () => {
      const users = UserFactory.createMultipleUsers(3);
      mockRepository.seed(users);

      const result = await getAllUsersUseCase.execute();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('age');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('updatedAt');
    });

    it('should return users with correct data', async () => {
      const user1 = UserFactory.reconstitute({
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        age: 25,
      });
      const user2 = UserFactory.reconstitute({
        id: 'user-2',
        name: 'Bob',
        email: 'bob@example.com',
        age: 30,
      });

      await mockRepository.save(user1);
      await mockRepository.save(user2);

      const result = await getAllUsersUseCase.execute();

      expect(result).toHaveLength(2);

      const alice = result.find((u) => u.name === 'Alice');
      const bob = result.find((u) => u.name === 'Bob');

      expect(alice).toBeDefined();
      expect(alice?.email).toBe('alice@example.com');
      expect(alice?.age).toBe(25);

      expect(bob).toBeDefined();
      expect(bob?.email).toBe('bob@example.com');
      expect(bob?.age).toBe(30);
    });

    it('should handle users without age', async () => {
      const user = UserFactory.reconstitute({
        id: 'user-no-age',
        name: 'Charlie',
        email: 'charlie@example.com',
      });
      await mockRepository.save(user);

      const result = await getAllUsersUseCase.execute();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Charlie');
      expect(result[0].age).toBeUndefined();
    });

    it('should return multiple users with varying data', async () => {
      const users = [
        UserFactory.reconstitute({
          id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          age: 20,
        }),
        UserFactory.reconstitute({
          id: 'user-2',
          name: 'User 2',
          email: 'user2@example.com',
          age: 25,
        }),
        UserFactory.reconstitute({
          id: 'user-3',
          name: 'User 3',
          email: 'user3@example.com',
        }),
        UserFactory.reconstitute({
          id: 'user-4',
          name: 'User 4',
          email: 'user4@example.com',
          age: 35,
        }),
      ];

      mockRepository.seed(users);

      const result = await getAllUsersUseCase.execute();

      expect(result).toHaveLength(4);
      expect(result.every((user) => user.id)).toBe(true);
      expect(result.every((user) => user.name)).toBe(true);
      expect(result.every((user) => user.email)).toBe(true);
      expect(result.every((user) => user.createdAt)).toBe(true);
      expect(result.every((user) => user.updatedAt)).toBe(true);
    });

    it('should return DTOs in correct format', async () => {
      const user = UserFactory.reconstitute({
        id: 'dto-test',
        name: 'DTO Test',
        email: 'dto@example.com',
        age: 40,
      });
      await mockRepository.save(user);

      const result = await getAllUsersUseCase.execute();

      expect(result[0]).toEqual({
        id: expect.any(String),
        name: 'DTO Test',
        email: 'dto@example.com',
        age: 40,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
