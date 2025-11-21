import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { Role, UserRole } from '../value-objects/Role';

export interface UserProps {
  id: UserId;
  name: string;
  email: Email;
  password: Password;
  role: Role;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly id: UserId;
  private name: string;
  private email: Email;
  private password: Password;
  private role: Role;
  private age?: number;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.age = props.age;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: {
    name: string;
    email: string;
    password: Password;
    role?: Role;
    age?: number;
  }): User {
    const now = new Date();

    if (!props.name || props.name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }

    if (props.age !== undefined && (props.age < 0 || props.age > 150)) {
      throw new Error('Invalid age');
    }

    return new User({
      id: UserId.create(),
      name: props.name.trim(),
      email: Email.create(props.email),
      password: props.password,
      role: props.role || Role.fromEnum(UserRole.USER),
      age: props.age,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // Business methods
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  public updateEmail(email: string): void {
    this.email = Email.create(email);
    this.updatedAt = new Date();
  }

  public updateAge(age: number): void {
    if (age < 0 || age > 150) {
      throw new Error('Invalid age');
    }
    this.age = age;
    this.updatedAt = new Date();
  }

  public async updatePassword(newPassword: Password): Promise<void> {
    this.password = newPassword;
    this.updatedAt = new Date();
  }

  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }

  public updateRole(role: Role): void {
    this.role = role;
    this.updatedAt = new Date();
  }

  // Getters
  public getId(): UserId {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getAge(): number | undefined {
    return this.age;
  }

  public getPassword(): Password {
    return this.password;
  }

  public getRole(): Role {
    return this.role;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public toJSON(): any {
    return {
      id: this.id.getValue(),
      name: this.name,
      email: this.email.getValue(),
      role: this.role.getValue(),
      age: this.age,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
