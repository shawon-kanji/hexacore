import { UpdateUserUseCase } from '../UpdateUserUseCase';
import { MockUserRepository } from '../../../../__tests__/mocks/MockUserRepository';
import { UserFactory } from '../../../../__tests__/factories/UserFactory';
import { UpdateUserDTO } from '../../../dto/UpdateUserDTO';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let mockMysqlRepository: MockUserRepository;
  let mockMongoRepository: MockUserRepository;
  let testUserId: string;

  beforeEach(async () => {
    mockMysqlRepository = new MockUserRepository();
    mockMongoRepository = new MockUserRepository();
    updateUserUseCase = new UpdateUserUseCase(mockMysqlRepository, mockMongoRepository);

    // Create a test user
    const testUser = UserFactory.reconstitute({
      id: 'test-user-id',
      name: 'Original Name',
      email: 'original@example.com',
      age: 25,
    });
    testUserId = testUser.getId().getValue();
    await mockMongoRepository.save(testUser);
    await mockMysqlRepository.save(testUser);
  });

  afterEach(() => {
    mockMysqlRepository.clear();
    mockMongoRepository.clear();
  });

  describe('execute', () => {
    it('should update user name successfully', async () => {
      const updateDTO: UpdateUserDTO = {
        name: 'Updated Name',
      };

      const result = await updateUserUseCase.execute(testUserId, updateDTO);

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('original@example.com');
      expect(result.age).toBe(25);
    });

    it('should update user email successfully', async () => {
      const updateDTO: UpdateUserDTO = {
        email: 'newemail@example.com',
      };

      const result = await updateUserUseCase.execute(testUserId, updateDTO);

      expect(result.name).toBe('Original Name');
      expect(result.email).toBe('newemail@example.com');
      expect(result.age).toBe(25);
    });

    it('should update user age successfully', async () => {
      const updateDTO: UpdateUserDTO = {
        age: 30,
      };

      const result = await updateUserUseCase.execute(testUserId, updateDTO);

      expect(result.name).toBe('Original Name');
      expect(result.email).toBe('original@example.com');
      expect(result.age).toBe(30);
    });

    it('should update multiple fields at once', async () => {
      const updateDTO: UpdateUserDTO = {
        name: 'New Name',
        email: 'new@example.com',
        age: 35,
      };

      const result = await updateUserUseCase.execute(testUserId, updateDTO);

      expect(result.name).toBe('New Name');
      expect(result.email).toBe('new@example.com');
      expect(result.age).toBe(35);
    });

    it('should update updatedAt timestamp', async () => {
      const user = await mockMongoRepository.findById(
        UserFactory.reconstitute({ id: testUserId }).getId()
      );
      const originalUpdatedAt = user!.getUpdatedAt();

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updateDTO: UpdateUserDTO = {
        name: 'Updated Name',
      };

      const result = await updateUserUseCase.execute(testUserId, updateDTO);

      expect(result.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw error when user not found', async () => {
      const updateDTO: UpdateUserDTO = {
        name: 'New Name',
      };

      await expect(updateUserUseCase.execute('non-existent-id', updateDTO)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error when email is already taken by another user', async () => {
      const anotherUser = UserFactory.reconstitute({
        id: 'another-user-id',
        name: 'Another User',
        email: 'taken@example.com',
      });
      await mockMongoRepository.save(anotherUser);

      const updateDTO: UpdateUserDTO = {
        email: 'taken@example.com',
      };

      await expect(updateUserUseCase.execute(testUserId, updateDTO)).rejects.toThrow(
        'Email already taken by another user'
      );
    });

    it('should allow user to keep their own email', async () => {
      const updateDTO: UpdateUserDTO = {
        email: 'original@example.com',
        name: 'Updated Name',
      };

      const result = await updateUserUseCase.execute(testUserId, updateDTO);

      expect(result.email).toBe('original@example.com');
      expect(result.name).toBe('Updated Name');
    });

    it('should throw error for invalid email format', async () => {
      const updateDTO: UpdateUserDTO = {
        email: 'invalid-email',
      };

      await expect(updateUserUseCase.execute(testUserId, updateDTO)).rejects.toThrow();
    });

    it('should throw error for empty name', async () => {
      const updateDTO: UpdateUserDTO = {
        name: '',
      };

      await expect(updateUserUseCase.execute(testUserId, updateDTO)).rejects.toThrow(
        'User name cannot be empty'
      );
    });

    it('should throw error for invalid age', async () => {
      const updateDTO: UpdateUserDTO = {
        age: 200,
      };

      await expect(updateUserUseCase.execute(testUserId, updateDTO)).rejects.toThrow(
        'Invalid age'
      );
    });

    it('should update in both MySQL and MongoDB repositories', async () => {
      const updateDTO: UpdateUserDTO = {
        name: 'Updated in Both',
      };

      await updateUserUseCase.execute(testUserId, updateDTO);

      const mysqlUser = await mockMysqlRepository.findById(
        UserFactory.reconstitute({ id: testUserId }).getId()
      );
      const mongoUser = await mockMongoRepository.findById(
        UserFactory.reconstitute({ id: testUserId }).getId()
      );

      expect(mysqlUser?.getName()).toBe('Updated in Both');
      expect(mongoUser?.getName()).toBe('Updated in Both');
    });

    it('should trim whitespace from name', async () => {
      const updateDTO: UpdateUserDTO = {
        name: '  Trimmed Name  ',
      };

      const result = await updateUserUseCase.execute(testUserId, updateDTO);

      expect(result.name).toBe('Trimmed Name');
    });
  });
});
