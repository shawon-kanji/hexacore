import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { CreateUserDTO } from '../dto/CreateUserDTO';
import { UpdateUserDTO } from '../dto/UpdateUserDTO';
import { UserDTO } from '../dto/UserDTO';
import { TYPES } from '../../shared/types/Types';

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.MySQLUserRepository) private mysqlRepository: IUserRepository,
    @inject(TYPES.MongoDBUserRepository) private mongoRepository: IUserRepository
  ) {}

  // Use MongoDB by default (for JSON-friendly, document-based data)
  private get defaultRepository(): IUserRepository {
    return this.mongoRepository;
  }

  // Use MySQL for relational data (can be accessed when needed)
  private get relationalRepository(): IUserRepository {
    return this.mysqlRepository;
  }

  async createUser(createUserDTO: CreateUserDTO): Promise<UserDTO> {
    // Check if user with email already exists
    const existingUser = await this.defaultRepository.findByEmail(
      Email.create(createUserDTO.email)
    );

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create user entity
    const user = User.create({
      name: createUserDTO.name,
      email: createUserDTO.email,
      age: createUserDTO.age,
    });

    // Save to BOTH databases to demonstrate multi-database capability
    await this.defaultRepository.save(user);  // Save to MongoDB
    await this.relationalRepository.save(user); // Save to MySQL

    return this.mapToDTO(user);
  }

  async getUserById(id: string): Promise<UserDTO> {
    const userId = UserId.fromString(id);
    const user = await this.defaultRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.mapToDTO(user);
  }

  async getUserByEmail(email: string): Promise<UserDTO> {
    const emailVO = Email.create(email);
    const user = await this.defaultRepository.findByEmail(emailVO);

    if (!user) {
      throw new Error('User not found');
    }

    return this.mapToDTO(user);
  }

  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.defaultRepository.findAll();
    return users.map((user) => this.mapToDTO(user));
  }

  async updateUser(id: string, updateUserDTO: UpdateUserDTO): Promise<UserDTO> {
    const userId = UserId.fromString(id);
    const user = await this.defaultRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update user entity
    if (updateUserDTO.name !== undefined) {
      user.updateName(updateUserDTO.name);
    }

    if (updateUserDTO.email !== undefined) {
      // Check if new email is already taken by another user
      const existingUser = await this.defaultRepository.findByEmail(
        Email.create(updateUserDTO.email)
      );

      if (existingUser && !existingUser.getId().equals(userId)) {
        throw new Error('Email already taken by another user');
      }

      user.updateEmail(updateUserDTO.email);
    }

    if (updateUserDTO.age !== undefined) {
      user.updateAge(updateUserDTO.age);
    }

    // Update in BOTH databases
    await this.defaultRepository.update(user);      // Update MongoDB
    await this.relationalRepository.update(user);    // Update MySQL

    return this.mapToDTO(user);
  }

  async deleteUser(id: string): Promise<void> {
    const userId = UserId.fromString(id);
    const exists = await this.defaultRepository.exists(userId);

    if (!exists) {
      throw new Error('User not found');
    }

    // Delete from BOTH databases
    await this.defaultRepository.delete(userId);      // Delete from MongoDB
    await this.relationalRepository.delete(userId);    // Delete from MySQL
  }

  private mapToDTO(user: User): UserDTO {
    return {
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      age: user.getAge(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };
  }
}
