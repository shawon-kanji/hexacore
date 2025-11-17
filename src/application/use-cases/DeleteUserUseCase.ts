import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

/**
 * Use Case: Delete a user
 *
 * Single Responsibility: Handle user deletion from both databases
 */
export class DeleteUserUseCase {
  constructor(
    private mysqlRepository: IUserRepository,
    private mongoRepository: IUserRepository
  ) {}

  async execute(id: string): Promise<void> {
    const userId = UserId.fromString(id);
    const exists = await this.mongoRepository.exists(userId);

    if (!exists) {
      throw new Error('User not found');
    }

    // Delete from BOTH databases
    await this.mongoRepository.delete(userId);
    await this.mysqlRepository.delete(userId);
  }
}
