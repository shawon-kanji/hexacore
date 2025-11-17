import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';
import { UserDTO } from '../dto/UserDTO';

/**
 * Use Case: Get a user by ID
 *
 * Single Responsibility: Retrieve a single user
 */
export class GetUserByIdUseCase {
  constructor(private mongoRepository: IUserRepository) {}

  async execute(id: string): Promise<UserDTO> {
    const userId = UserId.fromString(id);
    const user = await this.mongoRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

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
