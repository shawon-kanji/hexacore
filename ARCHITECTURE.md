# HexaCore Architecture

## Overview

HexaCore implements Clean Architecture (Hexagonal Architecture) with Domain-Driven Design principles, featuring proper dependency inversion and multi-database support.

## Core Principles

### Dependency Rule

All dependencies point **inward** toward the domain:

```
Presentation Layer (Controllers, Routes)
    ↓ depends on
Application Layer (Services, Use Cases, Interfaces)
    ↓ depends on
Domain Layer (Entities, Value Objects, Repository Interfaces)

Infrastructure Layer (Repository Implementations, Database)
    ↑ implements interfaces from
Application/Domain Layers
```

**Key Point:** The Application layer defines interfaces that the Infrastructure layer implements. This ensures business logic remains independent of technical details.

---

## Architecture Layers

### Domain Layer (`src/domain/`)

The core business logic with **zero external dependencies**.

**Components:**
- **Entities** - Business objects with identity and behavior
- **Value Objects** - Immutable values with validation (Email, UserId)
- **Repository Interfaces** - Define data access contracts (Ports)

**Example Entity:**
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
    this.email = new Email(newEmail); // Validates before updating
  }
}
```

### Application Layer (`src/application/`)

Business use cases and service orchestration.

**Components:**
- **Use Cases** - Single-responsibility operations (CreateUserUseCase, GetUserByIdUseCase)
- **Services** - Bounded contexts grouping related use cases
- **DTOs** - Data Transfer Objects for layer boundaries
- **Interfaces** - Abstract factories and contracts (IRepositoryFactory)

**Example Use Case:**
```typescript
export class CreateUserUseCase {
  constructor(
    private mysqlRepository: IUserRepository,
    private mongoRepository: IUserRepository
  ) {}

  async execute(data: CreateUserDTO): Promise<UserDTO> {
    const user = User.create(data);

    // Dual-write to both databases
    await this.mongoRepository.save(user);
    await this.mysqlRepository.save(user);

    return this.mapToDTO(user);
  }
}
```

**Example Service:**
```typescript
export class UserManagementService {
  constructor(private repositoryFactory: IRepositoryFactory) {}

  async createUser(data: CreateUserDTO) {
    const mysqlRepo = this.repositoryFactory.createMySQLUserRepository();
    const mongoRepo = this.repositoryFactory.createMongoDBUserRepository();

    const useCase = new CreateUserUseCase(mysqlRepo, mongoRepo);
    return useCase.execute(data);
  }
}
```

### Infrastructure Layer (`src/infrastructure/`)

Technical implementations and external system adapters.

**Components:**
- **Repository Implementations** - MySQLUserRepository, MongoDBUserRepository
- **Database Connections** - Singleton connection management
- **Repository Factory** - Concrete factory implementing IRepositoryFactory
- **Service Factory** - Composition root for creating services

**Example Repository Factory:**
```typescript
export class RepositoryFactory implements IRepositoryFactory {
  createMySQLUserRepository(): IUserRepository {
    return getMySQLUserRepository();
  }

  createMongoDBUserRepository(): IUserRepository {
    return getMongoDBUserRepository();
  }
}
```

### Presentation Layer (`src/presentation/`)

HTTP interface and request/response handling.

**Components:**
- **Controllers** - Handle HTTP requests, delegate to services
- **Routes** - Composition root, wire dependencies together
- **Middleware** - Express middleware functions

**Example Controller:**
```typescript
export class UserController {
  constructor(
    private profileService: UserProfileService,
    private managementService: UserManagementService
  ) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.managementService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
```

---

## Dependency Injection

### Composition Root

All dependencies are wired together in the route files (composition root):

```typescript
// src/presentation/routes/userRoutes.ts

// 1. Create services using factory functions from Infrastructure
const profileService = createUserProfileService();
const managementService = createUserManagementService();

// 2. Inject services into controller
const userController = new UserController(profileService, managementService);

// 3. Define routes
router.post('/', (req, res) => userController.createUser(req, res));
```

### Service Factory Pattern

Services are created through factory functions in the Infrastructure layer:

```typescript
// src/infrastructure/config/serviceFactory.ts

export function createUserManagementService(): UserManagementService {
  const repositoryFactory = new RepositoryFactory();
  return new UserManagementService(repositoryFactory);
}
```

**Benefits:**
- Application layer never imports from Infrastructure
- Easy to test by injecting mock factories
- All dependencies point inward
- Follows Dependency Inversion Principle

---

## Multi-Database Architecture

HexaCore uses a **dual-write pattern** - data is written to both MySQL and MongoDB simultaneously.

### Database Strategy

**Write Operations:**
- Create, Update, Delete → Write to **both** MySQL and MongoDB

**Read Operations:**
- Profile queries → Read from **MongoDB** (document-based queries)
- Relational queries → Can use **MySQL** if needed

### Configuration

Both databases are required and configured via environment variables:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=hexacore

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/hexacore
```

### Repository Singletons

Repositories use singleton pattern to reuse database connections:

```typescript
let mysqlUserRepository: MySQLUserRepository | null = null;

export function getMySQLUserRepository(): MySQLUserRepository {
  if (!mysqlUserRepository) {
    mysqlUserRepository = new MySQLUserRepository();
  }
  return mysqlUserRepository;
}
```

---

## Bounded Contexts

Services represent bounded contexts, grouping related operations:

### UserProfileService (Read Operations)
- `getUserProfile(id)` - Get single user
- `getAllUserProfiles()` - Get all users

### UserManagementService (Write Operations)
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update existing user
- `deleteUser(id)` - Delete user

**Future Services:**
- UserAuthService - Authentication and authorization
- UserNotificationService - User notifications
- UserPreferencesService - User settings management

---

## Adding New Features

### Add a New Use Case

1. Create use case file in `src/application/use-cases/`
2. Implement execute method with repository dependencies
3. Add method to appropriate service that creates the use case
4. Use service method in controller

### Add a New Service (Bounded Context)

1. Define service class in `src/application/services/`
2. Constructor accepts `IRepositoryFactory`
3. Service methods create and execute use cases
4. Add factory function in `src/infrastructure/config/serviceFactory.ts`
5. Inject service into controller in routes

### Add a New Repository

1. Define repository interface in `src/domain/repositories/`
2. Implement repository in `src/infrastructure/persistence/`
3. Add factory method to `IRepositoryFactory` interface
4. Implement factory method in `RepositoryFactory`
5. Add singleton factory function in `repositories.ts`

---

## Testing Strategy

### Unit Testing Domain

Test entities and value objects in isolation:

```typescript
test('User.create validates email', () => {
  expect(() => User.create({ name: 'John', email: 'invalid' }))
    .toThrow('Invalid email');
});
```

### Unit Testing Use Cases

Inject mock repositories:

```typescript
const mockMysql = createMock<IUserRepository>();
const mockMongo = createMock<IUserRepository>();
const useCase = new CreateUserUseCase(mockMysql, mockMongo);

await useCase.execute({ name: 'John', email: 'john@example.com' });

expect(mockMysql.save).toHaveBeenCalled();
expect(mockMongo.save).toHaveBeenCalled();
```

### Unit Testing Services

Inject mock factory:

```typescript
const mockFactory: IRepositoryFactory = {
  createMySQLUserRepository: () => mockMySQLRepo,
  createMongoDBUserRepository: () => mockMongoRepo,
};

const service = new UserManagementService(mockFactory);
await service.createUser(userData);
```

### Integration Testing

Use real databases with test containers or test database instances.

---

## File Structure

```
src/
├── application/
│   ├── dto/                           # Data Transfer Objects
│   │   ├── CreateUserDTO.ts
│   │   ├── UpdateUserDTO.ts
│   │   └── UserDTO.ts
│   ├── interfaces/                    # Application interfaces
│   │   └── IRepositoryFactory.ts
│   ├── services/                      # Bounded context services
│   │   ├── UserProfileService.ts
│   │   └── UserManagementService.ts
│   └── use-cases/                     # Business operations
│       ├── CreateUserUseCase.ts
│       ├── GetUserByIdUseCase.ts
│       ├── GetAllUsersUseCase.ts
│       ├── UpdateUserUseCase.ts
│       └── DeleteUserUseCase.ts
│
├── domain/
│   ├── entities/                      # Domain entities
│   │   └── User.ts
│   ├── repositories/                  # Repository interfaces (Ports)
│   │   └── IUserRepository.ts
│   └── value-objects/                 # Value objects
│       ├── Email.ts
│       └── UserId.ts
│
├── infrastructure/
│   ├── config/
│   │   ├── repositories.ts            # Repository singletons
│   │   ├── RepositoryFactory.ts       # Factory implementation
│   │   └── serviceFactory.ts          # Service composition root
│   ├── database/
│   │   ├── MySQLConnection.ts
│   │   └── MongoDBConnection.ts
│   └── persistence/                   # Repository implementations (Adapters)
│       ├── mongodb/
│       │   ├── MongoDBUserRepository.ts
│       │   └── UserSchema.ts
│       └── mysql/
│           └── MySQLUserRepository.ts
│
└── presentation/
    ├── controllers/                   # HTTP controllers
    │   └── UserController.ts
    └── routes/                        # Route definitions & composition
        └── userRoutes.ts
```

---

## Code Conventions

### TypeScript

- Strict mode enabled
- No decorators or experimental features
- Private members use `private` keyword
- Interfaces prefixed with `I` (e.g., `IUserRepository`)

### Naming

- **PascalCase** for classes: `UserService.ts`, `CreateUserUseCase.ts`
- **PascalCase** for interfaces: `IUserRepository.ts`, `IRepositoryFactory.ts`
- **PascalCase** for DTOs: `CreateUserDTO.ts`, `UpdateUserDTO.ts`
- **camelCase** for variables and functions

### Error Handling

- Domain entities throw errors for validation failures
- Use cases catch and transform errors appropriately
- Controllers return appropriate HTTP status codes

---

## Benefits of This Architecture

✅ **Independence** - Application logic independent of frameworks and databases
✅ **Testability** - Easy to test with mocked dependencies
✅ **Maintainability** - Clear separation of concerns
✅ **Flexibility** - Easy to swap implementations
✅ **Scalability** - Add new features without affecting existing code
✅ **Clean Dependencies** - All dependencies point inward

---

## Summary

HexaCore implements Uncle Bob's Clean Architecture with:

- **Proper Dependency Inversion** - High-level modules define interfaces
- **Abstract Factory Pattern** - IRepositoryFactory enables dependency injection
- **Composition Root** - Dependencies wired in Presentation layer
- **Bounded Contexts** - Services group related operations
- **Dual-Database Support** - Simultaneous writes to MySQL and MongoDB
- **Domain-Driven Design** - Rich domain models with business logic

This architecture ensures the codebase remains clean, testable, and maintainable as it scales.
