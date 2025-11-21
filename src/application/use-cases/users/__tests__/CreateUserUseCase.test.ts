import { CreateUserUseCase } from '../CreateUserUseCase';
import { MockUserRepository } from '../../../../__tests__/mocks/MockUserRepository';
import { UserFactory } from '../../../../__tests__/factories/UserFactory';
import { CreateUserDTO } from '../../../dto/CreateUserDTO';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockMysqlRepository: MockUserRepository;
  let mockMongoRepository: MockUserRepository;

  beforeEach(() => {
    mockMysqlRepository = new MockUserRepository();
    mockMongoRepository = new MockUserRepository();
    createUserUseCase = new CreateUserUseCase(mockMysqlRepository, mockMongoRepository);
  });

  afterEach(() => {
    mockMysqlRepository.clear();
    mockMongoRepository.clear();
  });

  describe('execute', () => {
    it('should create a new user successfully', async () => {
      const createUserDTO: CreateUserDTO = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: 30,
      };

      const result = await createUserUseCase.execute(createUserDTO);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.age).toBe(30);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Verify user was saved to both databases
      expect(mockMysqlRepository.count()).toBe(1);
      expect(mockMongoRepository.count()).toBe(1);
    });

    it('should create a user without age', async () => {
      const createUserDTO: CreateUserDTO = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      };

      const result = await createUserUseCase.execute(createUserDTO);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Jane Doe');
      expect(result.email).toBe('jane.doe@example.com');
      expect(result.age).toBeUndefined();
    });

    it('should throw error if user with email already exists', async () => {
      const existingUser = await UserFactory.createValidUser({
        email: 'existing@example.com',
      });
      await mockMongoRepository.save(existingUser);

      const createUserDTO: CreateUserDTO = {
        name: 'New User',
        email: 'existing@example.com',
        age: 25,
      };

      await expect(createUserUseCase.execute(createUserDTO)).rejects.toThrow(
        'User with this email already exists'
      );

      // Verify no new user was created
      expect(mockMongoRepository.count()).toBe(1);
      expect(mockMysqlRepository.count()).toBe(0);
    });

    it('should throw error for invalid email', async () => {
      const createUserDTO: CreateUserDTO = {
        name: 'Test User',
        email: 'invalid-email',
        age: 25,
      };

      await expect(createUserUseCase.execute(createUserDTO)).rejects.toThrow();
    });

    it('should throw error for empty name', async () => {
      const createUserDTO: CreateUserDTO = {
        name: '',
        email: 'test@example.com',
        age: 25,
      };

      await expect(createUserUseCase.execute(createUserDTO)).rejects.toThrow(
        'User name cannot be empty'
      );
    });

    it('should throw error for invalid age', async () => {
      const createUserDTO: CreateUserDTO = {
        name: 'Test User',
        email: 'test@example.com',
        age: 200,
      };

      await expect(createUserUseCase.execute(createUserDTO)).rejects.toThrow('Invalid age');
    });

    it('should trim whitespace from name', async () => {
      const createUserDTO: CreateUserDTO = {
        name: '  John Doe  ',
        email: 'john@example.com',
      };

      const result = await createUserUseCase.execute(createUserDTO);

      expect(result.name).toBe('John Doe');
    });

    it('should save to both MySQL and MongoDB repositories', async () => {
      const createUserDTO: CreateUserDTO = {
        name: 'Dual Database User',
        email: 'dual@example.com',
        age: 35,
      };

      await createUserUseCase.execute(createUserDTO);

      const mysqlUsers = await mockMysqlRepository.findAll();
      const mongoUsers = await mockMongoRepository.findAll();

      expect(mysqlUsers.length).toBe(1);
      expect(mongoUsers.length).toBe(1);
      expect(mysqlUsers[0].getName()).toBe('Dual Database User');
      expect(mongoUsers[0].getName()).toBe('Dual Database User');
    });
  });
});
