import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export interface UserProps {
  id: UserId;
  name: string;
  email: Email;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly id: UserId;
  private name: string;
  private email: Email;
  private age?: number;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.age = props.age;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: {
    name: string;
    email: string;
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
      age: this.age,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
