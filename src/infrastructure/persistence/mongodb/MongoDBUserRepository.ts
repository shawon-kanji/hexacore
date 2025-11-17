import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { UserModel, IUserDocument } from './UserSchema';

export class MongoDBUserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    try {
      const userDocument = new UserModel({
        _id: user.getId().getValue(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        age: user.getAge(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      });

      await userDocument.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const userDocument = await UserModel.findById(id.getValue());

    if (!userDocument) {
      return null;
    }

    return this.mapToUser(userDocument);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userDocument = await UserModel.findOne({
      email: email.getValue(),
    });

    if (!userDocument) {
      return null;
    }

    return this.mapToUser(userDocument);
  }

  async findAll(): Promise<User[]> {
    const userDocuments = await UserModel.find().sort({ createdAt: -1 });

    return userDocuments.map((doc) => this.mapToUser(doc));
  }

  async update(user: User): Promise<void> {
    const result = await UserModel.findByIdAndUpdate(
      user.getId().getValue(),
      {
        name: user.getName(),
        email: user.getEmail().getValue(),
        age: user.getAge(),
        updatedAt: user.getUpdatedAt(),
      },
      { new: true }
    );

    if (!result) {
      throw new Error('User not found');
    }
  }

  async delete(id: UserId): Promise<void> {
    const result = await UserModel.findByIdAndDelete(id.getValue());

    if (!result) {
      throw new Error('User not found');
    }
  }

  async exists(id: UserId): Promise<boolean> {
    const count = await UserModel.countDocuments({ _id: id.getValue() });
    return count > 0;
  }

  private mapToUser(document: IUserDocument): User {
    return User.reconstitute({
      id: UserId.fromString(document._id),
      name: document.name,
      email: Email.create(document.email),
      age: document.age,
      createdAt: new Date(document.createdAt),
      updatedAt: new Date(document.updatedAt),
    });
  }
}
