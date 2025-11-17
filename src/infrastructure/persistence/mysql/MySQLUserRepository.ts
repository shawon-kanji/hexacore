import { injectable } from 'inversify';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { UserId } from '../../../domain/value-objects/UserId';
import { Email } from '../../../domain/value-objects/Email';
import { MySQLConnection } from '../../database/MySQLConnection';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  age: number | null;
  created_at: Date;
  updated_at: Date;
}

@injectable()
export class MySQLUserRepository implements IUserRepository {
  private connection: MySQLConnection;

  constructor() {
    this.connection = MySQLConnection.getInstance();
  }

  async save(user: User): Promise<void> {
    const pool = this.connection.getPool();

    const query = `
      INSERT INTO users (id, name, email, age, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      user.getId().getValue(),
      user.getName(),
      user.getEmail().getValue(),
      user.getAge() || null,
      user.getCreatedAt(),
      user.getUpdatedAt(),
    ];

    try {
      await pool.execute(query, values);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  async findById(id: UserId): Promise<User | null> {
    const pool = this.connection.getPool();

    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.execute<UserRow[]>(query, [id.getValue()]);

    if (rows.length === 0) {
      return null;
    }

    return this.mapToUser(rows[0]);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const pool = this.connection.getPool();

    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute<UserRow[]>(query, [email.getValue()]);

    if (rows.length === 0) {
      return null;
    }

    return this.mapToUser(rows[0]);
  }

  async findAll(): Promise<User[]> {
    const pool = this.connection.getPool();

    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    const [rows] = await pool.execute<UserRow[]>(query);

    return rows.map((row) => this.mapToUser(row));
  }

  async update(user: User): Promise<void> {
    const pool = this.connection.getPool();

    const query = `
      UPDATE users
      SET name = ?, email = ?, age = ?, updated_at = ?
      WHERE id = ?
    `;

    const values = [
      user.getName(),
      user.getEmail().getValue(),
      user.getAge() || null,
      user.getUpdatedAt(),
      user.getId().getValue(),
    ];

    const [result]: any = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
  }

  async delete(id: UserId): Promise<void> {
    const pool = this.connection.getPool();

    const query = 'DELETE FROM users WHERE id = ?';
    const [result]: any = await pool.execute(query, [id.getValue()]);

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
  }

  async exists(id: UserId): Promise<boolean> {
    const pool = this.connection.getPool();

    const query = 'SELECT COUNT(*) as count FROM users WHERE id = ?';
    const [rows]: any = await pool.execute(query, [id.getValue()]);

    return rows[0].count > 0;
  }

  private mapToUser(row: UserRow): User {
    return User.reconstitute({
      id: UserId.fromString(row.id),
      name: row.name,
      email: Email.create(row.email),
      age: row.age || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
