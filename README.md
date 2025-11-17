# HexaCore

A TypeScript Node.js boilerplate implementing **Hexagonal Architecture** (Ports and Adapters), **Domain-Driven Design (DDD)**, and the **Repository Pattern** with support for both MySQL and MongoDB.

## Architecture Overview

This project demonstrates clean architecture principles with clear separation of concerns:

### Hexagonal Architecture (Ports and Adapters)

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (Controllers, Routes, DTOs)                 │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Application Layer                       │
│              (Services, Use Cases, DTOs)                 │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                    Domain Layer                          │
│         (Entities, Value Objects, Repositories)          │
│                      [PORTS]                             │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                Infrastructure Layer                      │
│    (Database Adapters, External Services, Config)       │
│                     [ADAPTERS]                           │
└─────────────────────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── domain/                      # Core business logic (no dependencies)
│   ├── entities/               # Business entities (User)
│   ├── value-objects/          # Value objects (Email, UserId)
│   └── repositories/           # Repository interfaces (PORTS)
│
├── application/                # Application business rules
│   ├── services/              # Application services
│   ├── use-cases/             # Use case implementations
│   └── dto/                   # Data Transfer Objects
│
├── infrastructure/             # External concerns (ADAPTERS)
│   ├── persistence/
│   │   ├── mysql/            # MySQL repository implementation
│   │   └── mongodb/          # MongoDB repository implementation
│   ├── database/             # Database connections
│   └── config/               # DI container configuration
│
├── presentation/              # API/UI layer
│   ├── controllers/          # HTTP controllers
│   ├── routes/              # Route definitions
│   └── middlewares/         # Express middlewares
│
└── shared/                   # Shared utilities
    ├── types/               # TypeScript types and DI symbols
    ├── errors/             # Custom error classes
    └── utils/              # Helper functions
```

## Key Features

- **Hexagonal Architecture**: Business logic is completely isolated from external concerns
- **Domain-Driven Design**: Rich domain model with entities and value objects
- **Repository Pattern**: Abstract data access through interfaces
- **Dependency Injection**: Using InversifyJS for IoC
- **Database Agnostic**: Easily switch between MySQL and MongoDB
- **Type Safety**: Full TypeScript support
- **Clean Code**: SOLID principles and separation of concerns

## How It Works

### The Repository Pattern

The repository pattern provides an abstraction layer between the domain and data layers:

1. **Interface (Port)**: `IUserRepository` in `src/domain/repositories/`
2. **Implementations (Adapters)**:
   - `MySQLUserRepository` in `src/infrastructure/persistence/mysql/`
   - `MongoDBUserRepository` in `src/infrastructure/persistence/mongodb/`

### Dependency Injection

The IoC container (`src/infrastructure/config/container.ts`) binds the appropriate repository based on the `DATABASE_TYPE` environment variable:

```typescript
if (DATABASE_TYPE === 'mongodb') {
  container.bind<IUserRepository>(TYPES.IUserRepository)
    .to(MongoDBUserRepository);
} else {
  container.bind<IUserRepository>(TYPES.IUserRepository)
    .to(MySQLUserRepository);
}
```

The `UserService` depends on `IUserRepository` interface, not on a concrete implementation:

```typescript
@injectable()
export class UserService {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}
}
```

**This means you can switch databases without changing a single line of code in the service layer!**

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL or MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hexacore
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` and set your database configuration:

```env
# Choose 'mysql' or 'mongodb'
DATABASE_TYPE=mysql

# MySQL Configuration (if using MySQL)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=hexacore

# MongoDB Configuration (if using MongoDB)
MONGODB_URI=mongodb://localhost:27017/hexacore
```

### Running the Application

Development mode with hot reload:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

## Switching Between Databases

To switch from MySQL to MongoDB (or vice versa):

1. Update `.env`:
```env
DATABASE_TYPE=mongodb  # or mysql
```

2. Restart the application

**That's it!** No code changes required. The application will automatically use the appropriate repository implementation.

## API Endpoints

### User CRUD Operations

#### Create User
```
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

#### Get All Users
```
GET /api/users
```

#### Get User by ID
```
GET /api/users/:id
```

#### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 28
}
```

#### Delete User
```
DELETE /api/users/:id
```

#### Health Check
```
GET /health
```

## Example Usage

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":25}'

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/{user-id}

# Update user
curl -X PUT http://localhost:3000/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Smith","age":26}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/{user-id}
```

## Domain Model

### User Entity

The User entity encapsulates business logic and invariants:

```typescript
const user = User.create({
  name: "John Doe",
  email: "john@example.com",
  age: 30
});

// Business methods
user.updateName("Jane Doe");
user.updateEmail("jane@example.com");
user.updateAge(31);
```

### Value Objects

- **UserId**: Unique identifier for users
- **Email**: Email validation and formatting

Value objects ensure domain invariants are always maintained.

## Extending the Boilerplate

### Adding a New Entity

1. Create entity in `src/domain/entities/`
2. Create repository interface in `src/domain/repositories/`
3. Implement repository adapters in `src/infrastructure/persistence/`
4. Create service in `src/application/services/`
5. Create controller in `src/presentation/controllers/`
6. Add routes in `src/presentation/routes/`
7. Register in DI container

### Adding a New Database Adapter

1. Create new folder in `src/infrastructure/persistence/`
2. Implement the repository interface
3. Add database connection in `src/infrastructure/database/`
4. Update DI container to include new adapter option

## Benefits of This Architecture

1. **Testability**: Easy to mock repositories and test business logic
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Switch databases or external services without changing business logic
4. **Scalability**: Add new features without affecting existing code
5. **Domain Focus**: Business logic is independent of technical details

## Architecture Principles

### Dependency Rule

Dependencies only point inward:
- Presentation → Application → Domain
- Infrastructure → Domain (implements interfaces)

The domain layer has **zero** external dependencies.

### SOLID Principles

- **S**ingle Responsibility: Each class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Repository implementations are interchangeable
- **I**nterface Segregation: Small, focused interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

## Technologies Used

- **TypeScript**: Type safety and better developer experience
- **Express**: Web framework
- **InversifyJS**: Dependency injection container
- **MySQL2**: MySQL driver
- **Mongoose**: MongoDB ODM
- **dotenv**: Environment configuration
- **Reflect-metadata**: Decorator metadata for DI

## License

MIT

## Contributing

Contributions are welcome! This is a boilerplate project meant to be forked and customized for your needs.

---

Built with Hexagonal Architecture principles for maximum flexibility and maintainability.
