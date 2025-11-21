# HexaCore

![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A professional TypeScript Node.js boilerplate implementing **Clean Architecture** (Hexagonal Architecture), **Domain-Driven Design**, and **multi-database support** with proper dependency inversion.

## Features

- **Clean Architecture** - Proper dependency inversion following Uncle Bob's principles
- **Domain-Driven Design** - Rich domain models with entities and value objects
- **Abstract Factory Pattern** - Dependency injection without frameworks
- **Dual-Database Support** - Simultaneous MySQL and MongoDB with sync
- **Bounded Contexts** - Services organized by business capabilities
- **Repository Pattern** - Database-agnostic data access
- **Authentication & RBAC** - JWT access/refresh tokens, password reset flow, and role guards
- **Type Safety** - Full TypeScript with strict mode
- **Zero Framework Dependencies** - Clean, explicit dependency injection

## Quick Start

```bash
# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run development server
yarn dev

# Build for production
yarn build
yarn start
```

## Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│           Presentation Layer (Routes, Controllers)  │
│                 Composition Root                     │
└──────────────────────┬──────────────────────────────┘
                       │ depends on
┌──────────────────────▼──────────────────────────────┐
│         Application Layer (Services, Use Cases)      │
│              Defines IRepositoryFactory              │
└──────────────────────┬──────────────────────────────┘
                       │ depends on
┌──────────────────────▼──────────────────────────────┐
│      Domain Layer (Entities, Value Objects)          │
│           Repository Interfaces (Ports)              │
└──────────────────────────────────────────────────────┘
                       ▲
                       │ implements
┌──────────────────────┴──────────────────────────────┐
│    Infrastructure Layer (Implementations)            │
│    Repository Implementations, RepositoryFactory    │
└──────────────────────────────────────────────────────┘
```

**Key Principle:** All dependencies point **inward**. The Application layer defines interfaces; Infrastructure implements them.

### Folder Structure

```
src/
├── domain/                    # Business logic (zero dependencies)
│   ├── entities/             # User
│   ├── value-objects/        # Email, UserId
│   └── repositories/         # IUserRepository (interface)
│
├── application/               # Business use cases
│   ├── dto/                  # Data Transfer Objects
│   ├── interfaces/           # IRepositoryFactory
│   ├── services/             # UserManagementService, UserProfileService
│   └── use-cases/            # CreateUserUseCase, GetUserByIdUseCase, etc.
│
├── infrastructure/            # Technical implementations
│   ├── config/
│   │   ├── repositories.ts   # Singleton factory functions
│   │   ├── RepositoryFactory.ts  # Implements IRepositoryFactory
│   │   └── serviceFactory.ts     # Service composition functions
│   ├── database/             # MySQL and MongoDB connections
│   └── persistence/
│       ├── mysql/           # MySQLUserRepository
│       └── mongodb/         # MongoDBUserRepository
│
└── presentation/              # HTTP interface
    ├── controllers/          # UserController
    └── routes/              # Composition root
```

## How It Works

### Dependency Injection

Dependencies are wired together in the **composition root** (route files):

```typescript
// src/presentation/routes/userRoutes.ts

import { createUserProfileService, createUserManagementService }
  from '../../infrastructure/config/serviceFactory';

// 1. Create services using factory functions
const profileService = createUserProfileService();
const managementService = createUserManagementService();

// 2. Inject into controller
const userController = new UserController(profileService, managementService);

// 3. Define routes
router.post('/', (req, res) => userController.createUser(req, res));
```

### Abstract Factory Pattern

The Application layer defines the factory interface:

```typescript
// src/application/interfaces/IRepositoryFactory.ts
export interface IRepositoryFactory {
  createMySQLUserRepository(): IUserRepository;
  createMongoDBUserRepository(): IUserRepository;
}
```

Infrastructure implements the interface:

```typescript
// src/infrastructure/config/RepositoryFactory.ts
export class RepositoryFactory implements IRepositoryFactory {
  createMySQLUserRepository(): IUserRepository {
    return getMySQLUserRepository(); // Singleton
  }

  createMongoDBUserRepository(): IUserRepository {
    return getMongoDBUserRepository(); // Singleton
  }
}
```

Services receive the factory via constructor:

```typescript
// src/application/services/UserManagementService.ts
export class UserManagementService {
  constructor(private repositoryFactory: IRepositoryFactory) {}

  async createUser(data: CreateUserDTO) {
    // Service creates use case with repositories from factory
    const mysqlRepo = this.repositoryFactory.createMySQLUserRepository();
    const mongoRepo = this.repositoryFactory.createMongoDBUserRepository();

    const useCase = new CreateUserUseCase(mysqlRepo, mongoRepo);
    return useCase.execute(data);
  }
}
```

**Benefits:**
- Application layer never imports from Infrastructure
- Easy to test with mock factories
- True dependency inversion
- All dependencies point inward

### Bounded Contexts

Services represent bounded contexts:

- **UserProfileService** - Read operations (profile viewing)
- **UserManagementService** - Write operations (CRUD lifecycle)

Each service groups related use cases by business capability.

### Use Cases

Use cases implement single business operations:

```typescript
export class CreateUserUseCase {
  constructor(
    private mysqlRepository: IUserRepository,
    private mongoRepository: IUserRepository
  ) {}

  async execute(data: CreateUserDTO): Promise<UserDTO> {
    const user = User.create(data);

    // Dual-write pattern
    await this.mongoRepository.save(user);
    await this.mysqlRepository.save(user);

    return this.mapToDTO(user);
  }
}
```

## Multi-Database Architecture

### Dual-Write Pattern

Data is written to **both** MySQL and MongoDB simultaneously:

- **Create** → Writes to both databases
- **Update** → Updates both databases
- **Delete** → Removes from both databases
- **Read** → Reads from MongoDB (document-based queries)

### Configuration

Both databases are required:

```env
# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=hexacore

# MongoDB
MONGODB_URI=mongodb://localhost:27017/hexacore
```

## API Endpoints

### User Operations

```bash
# Create user
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}

# Get all users
GET /api/users

# Get user by ID
GET /api/users/:id

# Update user
PUT /api/users/:id
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

# Delete user
DELETE /api/users/:id

# Health check
GET /health
```

## Domain Model

### Entities

Entities encapsulate business logic:

```typescript
export class User {
  private constructor(
    private readonly id: UserId,
    private name: string,
    private email: Email,
    private readonly age?: number
  ) {}

  static create(props: CreateUserProps): User {
    // Validation and business rules
    return new User(UserId.generate(), props.name, new Email(props.email), props.age);
  }

  updateEmail(newEmail: string): void {
    this.email = new Email(newEmail); // Validates
  }
}
```

### Value Objects

Value objects ensure domain invariants:

```typescript
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email format');
    }
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

## Adding New Features

### Add a New Use Case

1. Create use case in `src/application/use-cases/`
2. Add method to appropriate service
3. Service creates and executes the use case

### Add a New Service (Bounded Context)

1. Create service in `src/application/services/`
2. Service constructor accepts `IRepositoryFactory`
3. Add factory function in `src/infrastructure/config/serviceFactory.ts`
4. Inject service into controller

### Add a New Entity

1. Create entity in `src/domain/entities/`
2. Create repository interface in `src/domain/repositories/`
3. Implement repositories in `src/infrastructure/persistence/`
4. Update `IRepositoryFactory` and `RepositoryFactory`
5. Create use cases and services
6. Create controller and routes

## Testing

### Unit Test Use Cases

```typescript
const mockMySQLRepo = createMock<IUserRepository>();
const mockMongoRepo = createMock<IUserRepository>();

const useCase = new CreateUserUseCase(mockMySQLRepo, mockMongoRepo);
await useCase.execute(userData);

expect(mockMySQLRepo.save).toHaveBeenCalled();
expect(mockMongoRepo.save).toHaveBeenCalled();
```

### Unit Test Services

```typescript
const mockFactory: IRepositoryFactory = {
  createMySQLUserRepository: () => mockMySQLRepo,
  createMongoDBUserRepository: () => mockMongoRepo,
};

const service = new UserManagementService(mockFactory);
await service.createUser(userData);
```

### Unit Test Domain

```typescript
test('Email validates format', () => {
  expect(() => new Email('invalid')).toThrow('Invalid email format');
  expect(() => new Email('valid@example.com')).not.toThrow();
});
```

## Technologies

- **TypeScript 5.3** - Type safety with strict mode
- **Node.js 16+** - JavaScript runtime
- **Express 4.18** - Web framework
- **MySQL2 3.6** - MySQL database driver
- **Mongoose 8.0** - MongoDB ODM
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

## Scripts

```bash
yarn dev        # Development with hot reload
yarn build      # Build TypeScript to JavaScript
yarn start      # Production: build + run
yarn lint       # Run ESLint
yarn format     # Format with Prettier
```

## Architecture Benefits

✅ **Testability** - Easy to mock dependencies
✅ **Maintainability** - Clear separation of concerns
✅ **Flexibility** - Swap implementations without changing business logic
✅ **Independence** - Business logic independent of frameworks and databases
✅ **Scalability** - Add features without affecting existing code
✅ **Type Safety** - Full TypeScript support

## Design Principles

- **Dependency Inversion** - High-level modules define interfaces
- **Single Responsibility** - Each class has one reason to change
- **Open/Closed** - Open for extension, closed for modification
- **Interface Segregation** - Small, focused interfaces
- **Clean Architecture** - Dependencies point inward only

## Documentation

- `ARCHITECTURE.md` - Detailed architecture documentation
- `CLAUDE.md` - Guide for Claude Code AI assistant

## License

MIT

## Author

Created by [Shawon Kanji](https://github.com/shawon-kanji)

---

Built with Clean Architecture and Domain-Driven Design principles for maximum flexibility and maintainability.
