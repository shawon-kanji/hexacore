import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { Role } from '../../../domain/value-objects/Role';
import { getPrismaClient } from '../../database/PrismaClient';
import { ConflictError, NotFoundError } from '../../../shared/errors';

/**
 * Prisma User Repository
 *
 * Implements IUserRepository using Prisma ORM.
 * Replaces manual SQL queries with type-safe Prisma queries.
 *
 * Benefits:
 * - Type-safe database queries
 * - Automatic connection pooling
 * - Better performance with query optimization
 * - Migration management
 * - No manual SQL writing
 */
export class PrismaUserRepository implements IUserRepository {
  private prisma = getPrismaClient();

  async save(user: User): Promise<void> {
    try {
      await this.prisma.user.create({
        data: {
          id: user.getId().getValue(),
          name: user.getName(),
          email: user.getEmail().getValue(),
          password: user.getPassword().getValue(),
          role: user.getRole().getValue(),
          age: user.getAge() ?? null,
          createdAt: user.getCreatedAt(),
          updatedAt: user.getUpdatedAt(),
        },
      });
    } catch (error: any) {
      // Handle Prisma unique constraint violations
      if (error.code === 'P2002') {
        throw new ConflictError('User with this email already exists', {
          email: user.getEmail().getValue(),
        });
      }
      throw error;
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
    });

    if (!userRecord) {
      return null;
    }

    return this.mapToUser(userRecord);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userRecord = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!userRecord) {
      return null;
    }

    return this.mapToUser(userRecord);
  }

  async findAll(): Promise<User[]> {
    const userRecords = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return userRecords.map((record) => this.mapToUser(record));
  }

  async update(user: User): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: user.getId().getValue() },
        data: {
          name: user.getName(),
          email: user.getEmail().getValue(),
          password: user.getPassword().getValue(),
          role: user.getRole().getValue(),
          age: user.getAge() ?? null,
          updatedAt: user.getUpdatedAt(),
        },
      });
    } catch (error: any) {
      // Handle record not found
      if (error.code === 'P2025') {
        throw new NotFoundError('User not found', { userId: user.getId().getValue() });
      }
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        throw new ConflictError('User with this email already exists', {
          email: user.getEmail().getValue(),
        });
      }
      throw error;
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id: id.getValue() },
      });
    } catch (error: any) {
      // Handle record not found
      if (error.code === 'P2025') {
        throw new NotFoundError('User not found', { userId: id.getValue() });
      }
      throw error;
    }
  }

  async exists(id: UserId): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: id.getValue() },
    });

    return count > 0;
  }

  private mapToUser(record: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    age: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.reconstitute({
      id: UserId.fromString(record.id),
      name: record.name,
      email: Email.create(record.email),
      password: Password.fromHash(record.password),
      role: Role.create(record.role),
      age: record.age ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
