# Claude Code Guide

This file provides guidance to Claude Code when working with this repository.

## Project Overview

HexaCore is a TypeScript Node.js boilerplate implementing Clean Architecture (Hexagonal Architecture) with Domain-Driven Design principles and multi-database support.

**Key Features:**
- Clean Architecture with proper dependency inversion
- Domain-Driven Design (DDD) patterns
- Dual-database support (MySQL + MongoDB)
- Abstract Factory pattern for dependency injection
- Repository pattern with singleton instances
- Bounded context services

## Development Commands

```bash
# Development with hot reload
yarn dev

# Build TypeScript to JavaScript
yarn build

# Production: build + run
yarn start

# Code quality
yarn lint
yarn format
```

## Architecture Overview

### Dependency Rule

Dependencies must point **inward only**:

```
Presentation → Application → Domain ← Infrastructure
```

- **Presentation** depends on Application
- **Application** defines interfaces; **Infrastructure** implements them
- **Domain** has zero external dependencies

### Layer Responsibilities

**Domain Layer** (`src/domain/`)
- Business entities with logic (User)
- Value objects (Email, UserId)
- Repository interfaces (IUserRepository)
- Zero external dependencies

**Application Layer** (`src/application/`)
- Use cases (CreateUserUseCase, GetUserByIdUseCase)
- Services grouping use cases (UserManagementService, UserProfileService)
- DTOs for data transfer
- Interfaces (IRepositoryFactory)

**Infrastructure Layer** (`src/infrastructure/`)
- Repository implementations (MySQLUserRepository, MongoDBUserRepository)
- Database connections
- RepositoryFactory (implements IRepositoryFactory)
- Service factory functions (composition root)

**Presentation Layer** (`src/presentation/`)
- Controllers (UserController)
- Routes (composition root)
- Express middleware

## Dependency Injection Pattern

### How Dependencies Are Wired

All dependency wiring happens in **route files** (composition root):

```typescript
// src/presentation/routes/userRoutes.ts

// 1. Create services using factory functions
const profileService = createUserProfileService();
const managementService = createUserManagementService();

// 2. Inject services into controller
const userController = new UserController(profileService, managementService);

// 3. Define routes
router.post('/', (req, res) => userController.createUser(req, res));
```

### Service Factory Pattern

Services are created through factory functions in Infrastructure:

```typescript
// src/infrastructure/config/serviceFactory.ts

export function createUserManagementService(): UserManagementService {
  const repositoryFactory = new RepositoryFactory();
  return new UserManagementService(repositoryFactory);
}
```

### Repository Factory Pattern

Repositories use **Abstract Factory pattern** + **Singleton pattern**:

```typescript
// IRepositoryFactory interface in Application layer
export interface IRepositoryFactory {
  createMySQLUserRepository(): IUserRepository;
  createMongoDBUserRepository(): IUserRepository;
}

// Implementation in Infrastructure layer
export class RepositoryFactory implements IRepositoryFactory {
  createMySQLUserRepository(): IUserRepository {
    return getMySQLUserRepository(); // Returns singleton
  }
}

// Singleton factory
let mysqlUserRepository: MySQLUserRepository | null = null;

export function getMySQLUserRepository(): MySQLUserRepository {
  if (!mysqlUserRepository) {
    mysqlUserRepository = new MySQLUserRepository();
  }
  return mysqlUserRepository;
}
```

**Key Points:**
- Application layer defines `IRepositoryFactory` interface
- Infrastructure layer implements the interface
- Services receive `IRepositoryFactory` via constructor
- Repositories are singletons (database connections reused)

## Multi-Database Architecture

### Dual-Write Pattern

The application writes to **both** MySQL and MongoDB simultaneously:

```typescript
// In CreateUserUseCase
async execute(data: CreateUserDTO) {
  const user = User.create(data);

  // Write to both databases
  await this.mongoRepository.save(user);
  await this.mysqlRepository.save(user);

  return this.mapToDTO(user);
}
```

### Database Configuration

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

## Adding New Features

### Add a New Use Case

1. Create file in `src/application/use-cases/`:
```typescript
export class NewFeatureUseCase {
  constructor(private repository: IUserRepository) {}

  async execute(data: SomeDTO): Promise<ResultDTO> {
    // Business logic here
  }
}
```

2. Add method to appropriate service:
```typescript
export class UserManagementService {
  constructor(private repositoryFactory: IRepositoryFactory) {}

  async newFeature(data: SomeDTO) {
    const repo = this.repositoryFactory.createMongoDBUserRepository();
    const useCase = new NewFeatureUseCase(repo);
    return useCase.execute(data);
  }
}
```

3. Use in controller:
```typescript
async newFeature(req: Request, res: Response) {
  const result = await this.managementService.newFeature(req.body);
  res.json(result);
}
```

### Add a New Service (Bounded Context)

1. Create service class in `src/application/services/`:
```typescript
export class NewBoundedContextService {
  constructor(private repositoryFactory: IRepositoryFactory) {}

  async someOperation(data: DTO) {
    const repo = this.repositoryFactory.createMongoDBUserRepository();
    const useCase = new SomeUseCase(repo);
    return useCase.execute(data);
  }
}
```

2. Add factory function in `src/infrastructure/config/serviceFactory.ts`:
```typescript
export function createNewBoundedContextService(): NewBoundedContextService {
  const repositoryFactory = new RepositoryFactory();
  return new NewBoundedContextService(repositoryFactory);
}
```

3. Update controller constructor to accept new service
4. Wire in routes file

### Add a New Entity

1. **Domain Layer** - Create entity in `src/domain/entities/`:
```typescript
export class Product {
  private constructor(/* properties */) {}

  static create(props: CreateProps): Product {
    // Validation
    return new Product(/* ... */);
  }
}
```

2. **Domain Layer** - Create repository interface in `src/domain/repositories/`:
```typescript
export interface IProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
}
```

3. **Infrastructure Layer** - Implement repositories in `src/infrastructure/persistence/`

4. **Infrastructure Layer** - Add to factory:
```typescript
// Update IRepositoryFactory interface
export interface IRepositoryFactory {
  // Existing methods...
  createMySQLProductRepository(): IProductRepository;
  createMongoDBProductRepository(): IProductRepository;
}

// Update RepositoryFactory implementation
export class RepositoryFactory implements IRepositoryFactory {
  // Existing methods...
  createMySQLProductRepository(): IProductRepository {
    return getMySQLProductRepository();
  }
}
```

5. **Application Layer** - Create use cases and services
6. **Presentation Layer** - Create controller and routes

### Add a New Database Adapter

1. Create repository implementation in `src/infrastructure/persistence/[database]/`
2. Implement appropriate repository interface
3. Create database connection in `src/infrastructure/database/`
4. Add factory function in `src/infrastructure/config/repositories.ts`
5. Update `RepositoryFactory` to include new repository

## Domain-Driven Design Patterns

### Entities

Entities use factory methods with private constructors:

```typescript
export class User {
  private constructor(
    private readonly id: UserId,
    private name: string,
    private email: Email
  ) {}

  // For creating new entities
  static create(props: CreateUserProps): User {
    // Validation here
    return new User(UserId.generate(), props.name, new Email(props.email));
  }

  // For loading from database
  static reconstitute(props: ExistingUserProps): User {
    return new User(props.id, props.name, props.email);
  }

  // Business methods
  updateEmail(newEmail: string): void {
    this.email = new Email(newEmail); // Validates
  }
}
```

### Value Objects

Value objects are immutable with validation:

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

  getValue(): string {
    return this.value;
  }
}
```

### Bounded Contexts

Services represent bounded contexts:

- **UserProfileService** - User profile viewing (read operations)
- **UserManagementService** - User lifecycle management (CRUD operations)
- **Future: UserAuthService** - Authentication and authorization
- **Future: UserNotificationService** - User notifications

## Testing Strategy

### Unit Test Domain

Test entities and value objects in isolation:

```typescript
test('Email validates format', () => {
  expect(() => new Email('invalid')).toThrow('Invalid email format');
  expect(() => new Email('valid@example.com')).not.toThrow();
});
```

### Unit Test Use Cases

Use mock repositories:

```typescript
const mockRepository = {
  save: jest.fn(),
  findById: jest.fn(),
} as jest.Mocked<IUserRepository>;

const useCase = new CreateUserUseCase(mockRepository, mockRepository);
await useCase.execute(userData);

expect(mockRepository.save).toHaveBeenCalledTimes(2);
```

### Unit Test Services

Use mock factory:

```typescript
const mockFactory: IRepositoryFactory = {
  createMySQLUserRepository: () => mockRepo,
  createMongoDBUserRepository: () => mockRepo,
};

const service = new UserManagementService(mockFactory);
await service.createUser(userData);
```

### Integration Tests

Use real database instances or test containers.

## Code Conventions

### TypeScript
- Strict mode enabled
- No decorators or experimental features
- Private members use `private` keyword
- Interfaces prefixed with `I`

### File Naming
- PascalCase for classes: `UserService.ts`
- PascalCase for interfaces: `IUserRepository.ts`
- PascalCase for DTOs: `CreateUserDTO.ts`

### Error Handling
- Entities throw errors for validation failures
- Use cases transform errors appropriately
- Controllers return HTTP status codes

## Important Principles

**Never:**
- Import from Infrastructure in Application layer
- Add dependencies from outer layers to inner layers
- Skip the Abstract Factory pattern
- Create repositories without singleton factory functions
- Expose domain entities directly in HTTP responses

**Always:**
- Define interfaces in Application, implement in Infrastructure
- Use DTOs at layer boundaries
- Wire dependencies in composition root (route files)
- Maintain single responsibility in use cases
- Group related operations in bounded context services

## Environment Variables

Required environment variables:

```env
# Server
PORT=3000
NODE_ENV=development

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=hexacore

# MongoDB
MONGODB_URI=mongodb://localhost:27017/hexacore
```

## Summary

HexaCore implements Clean Architecture with:
- Proper dependency inversion using Abstract Factory pattern
- Bounded context services grouping use cases
- Dual-database support with dual-write pattern
- Domain-Driven Design with entities and value objects
- Composition root in Presentation layer
- Singleton repositories for connection reuse

All dependencies point inward, ensuring business logic remains independent of frameworks and databases.
