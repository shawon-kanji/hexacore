import { GetUserByIdUseCase } from '../GetUserByIdUseCase';
import { MockUserRepository } from '../../../../__tests__/mocks/MockUserRepository';
import { UserFactory } from '../../../../__tests__/factories/UserFactory';
import { NotFoundError } from '../../../../shared/errors';

describe('GetUserByIdUseCase', () => {
  let getUserByIdUseCase: GetUserByIdUseCase;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    getUserByIdUseCase = new GetUserByIdUseCase(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe('execute', () => {
    it('should return a user when found', async () => {
      const user = UserFactory.reconstitute({
        id: 'test-id-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: 30,
      });
      await mockRepository.save(user);

      const result = await getUserByIdUseCase.execute('test-id-123');

      expect(result).toHaveProperty('id', 'test-id-123');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.age).toBe(30);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should return user without age if age is not set', async () => {
      const user = UserFactory.reconstitute({
        id: 'user-without-age',
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
      await mockRepository.save(user);

      const result = await getUserByIdUseCase.execute('user-without-age');

      expect(result).toHaveProperty('id', 'user-without-age');
      expect(result.name).toBe('Jane Doe');
      expect(result.age).toBeUndefined();
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const nonExistentId = 'non-existent-id';

      await expect(getUserByIdUseCase.execute(nonExistentId)).rejects.toThrow(NotFoundError);
      await expect(getUserByIdUseCase.execute(nonExistentId)).rejects.toThrow('User not found');
    });

    it('should throw error for invalid UUID format', async () => {
      await expect(getUserByIdUseCase.execute('invalid-uuid')).rejects.toThrow();
    });

    it('should return correct DTO format', async () => {
      const user = UserFactory.reconstitute({
        id: 'dto-test-id',
        name: 'DTO Test User',
        email: 'dto@example.com',
        age: 25,
      });
      await mockRepository.save(user);

      const result = await getUserByIdUseCase.execute('dto-test-id');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
      expect(Object.keys(result).length).toBe(6);
    });
  });
});
