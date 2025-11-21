import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { Role, UserRole } from '../../../domain/value-objects/Role';
import { CreateUserDTO } from '../../dto/CreateUserDTO';
import { UserDTO } from '../../dto/UserDTO';

/**
 * Use Case: Create a new user
 *
 * @deprecated Use RegisterUserUseCase instead for proper authentication
 * This is kept for backward compatibility with existing tests
 *
 * Single Responsibility: Handle user creation with validation
 * and dual-database persistence
 */
export class CreateUserUseCase {
  constructor(
    private mysqlRepository: IUserRepository,
    private mongoRepository: IUserRepository
  ) {}

  async execute(createUserDTO: CreateUserDTO): Promise<UserDTO> {
    // Check if user with email already exists
    const existingUser = await this.mongoRepository.findByEmail(Email.create(createUserDTO.email));

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create temporary password for testing
    // In production, use RegisterUserUseCase instead
    const tempPassword = await Password.create('TempPassword123!');

    // Create user entity (domain validation happens here)
    const user = User.create({
      name: createUserDTO.name,
      email: createUserDTO.email,
      password: tempPassword,
      role: Role.fromEnum(UserRole.USER),
      age: createUserDTO.age,
    });

    // Save to BOTH databases (dual-write pattern)
    await this.mongoRepository.save(user);
    await this.mysqlRepository.save(user);

    return this.mapToDTO(user);
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
