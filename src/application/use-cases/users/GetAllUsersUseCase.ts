import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserDTO } from '../../dto/UserDTO';

/**
 * Use Case: Get all users
 *
 * Single Responsibility: Retrieve all users from database
 */
export class GetAllUsersUseCase {
  constructor(private mongoRepository: IUserRepository) {}

  async execute(): Promise<UserDTO[]> {
    const users = await this.mongoRepository.findAll();

    return users.map((user) => ({
      id: user.getId().getValue(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      age: user.getAge(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    }));
  }
}
