import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { UpdateUserDTO } from '../../dto/UpdateUserDTO';
import { UserDTO } from '../../dto/UserDTO';

/**
 * Use Case: Update user information
 *
 * Single Responsibility: Handle user updates with validation
 * and dual-database persistence
 */
export class UpdateUserUseCase {
  constructor(
    private mysqlRepository: IUserRepository,
    private mongoRepository: IUserRepository
  ) {}

  async execute(id: string, updateUserDTO: UpdateUserDTO): Promise<UserDTO> {
    const userId = UserId.fromString(id);
    const user = await this.mongoRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update user entity (domain validation happens here)
    if (updateUserDTO.name !== undefined) {
      user.updateName(updateUserDTO.name);
    }

    if (updateUserDTO.email !== undefined) {
      // Check if new email is already taken by another user
      const existingUser = await this.mongoRepository.findByEmail(
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
    await this.mongoRepository.update(user);
    await this.mysqlRepository.update(user);

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
