# HexaCore

![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)
![Node.js](https://img.shields.io/badge/Node.js-16+-green)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A TypeScript Node.js boilerplate implementing **Hexagonal Architecture** (Ports and Adapters), **Domain-Driven Design (DDD)**, and the **Repository Pattern** with support for both MySQL and MongoDB.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/shawon-kanji/hexacore.git
cd hexacore

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run in development mode
yarn dev

# Or build and run production
yarn build
yarn start
```

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Switching Between Databases](#switching-between-databases)
- [Extending the Boilerplate](#extending-the-boilerplate)
- [Technologies Used](#technologies-used)

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
- **Multi-Database Support**: Simultaneous connections to MySQL and MongoDB with automatic synchronization
- **Dependency Injection**: Using InversifyJS for IoC
- **Polyglot Persistence**: Use multiple databases in a single application
- **Type Safety**: Full TypeScript support with strict mode
- **Clean Code**: SOLID principles and separation of concerns
- **Dual-Write Pattern**: Automatic data synchronization across databases

## How It Works

### The Repository Pattern

The repository pattern provides an abstraction layer between the domain and data layers:

1. **Interface (Port)**: `IUserRepository` in `src/domain/repositories/`
2. **Implementations (Adapters)**:
   - `MySQLUserRepository` in `src/infrastructure/persistence/mysql/`
   - `MongoDBUserRepository` in `src/infrastructure/persistence/mongodb/`

### Dependency Injection & Multi-Database Support

The IoC container (`src/infrastructure/config/container.ts`) registers **both** repository implementations:

```typescript
// Bind BOTH repository implementations
container
  .bind<IUserRepository>(TYPES.MySQLUserRepository)
  .to(MySQLUserRepository)
  .inSingletonScope();

container
  .bind<IUserRepository>(TYPES.MongoDBUserRepository)
  .to(MongoDBUserRepository)
  .inSingletonScope();
```

The `UserService` injects **both repositories** simultaneously, enabling multi-database operations:

```typescript
@injectable()
export class UserService {
  constructor(
    @inject(TYPES.MySQLUserRepository) private mysqlRepository: IUserRepository,
    @inject(TYPES.MongoDBUserRepository) private mongoRepository: IUserRepository
  ) {}

  // Use MongoDB as default (document-based data)
  private get defaultRepository(): IUserRepository {
    return this.mongoRepository;
  }

  // Use MySQL for relational data (when needed)
  private get relationalRepository(): IUserRepository {
    return this.mysqlRepository;
  }
}
```

**This architecture allows you to:**
- Write to multiple databases simultaneously (dual-write pattern)
- Read from your preferred database (MongoDB by default)
- Use different databases for different operations
- Add more databases without changing business logic

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL and/or MongoDB (supports dual database setup)
- yarn (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shawon-kanji/hexacore.git
cd hexacore
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` and configure **both** database connections (both are required):

```env
# Application
PORT=3000
NODE_ENV=development

# MySQL Configuration (Required)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=hexacore

# MongoDB Configuration (Required)
MONGODB_URI=mongodb://localhost:27017/hexacore
```

**Note:** Both MySQL and MongoDB connections are required as the application uses both databases simultaneously.

### Running the Application

Development mode with hot reload:
```bash
yarn dev
# or
npm run dev
```

Build for production:
```bash
yarn build
yarn start
# or
npm run build
npm start
```

### Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build TypeScript to JavaScript
- `yarn start` - Run production build
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier

## Database Configuration

### Multi-Database Architecture

This application implements a **multi-database architecture** that connects to both MySQL and MongoDB simultaneously. Data operations automatically sync across both databases:

**How it works:**
- **Create operations**: Data is written to both MySQL and MongoDB
- **Read operations**: Data is read from MongoDB (the default repository)
- **Update operations**: Changes are synchronized to both databases
- **Delete operations**: Data is removed from both databases

**Benefits:**
- No single point of database failure
- Use the best database for each use case
- Seamless data synchronization
- Easy to add more databases

### Current Implementation

The `UserService` demonstrates the multi-database pattern:

```typescript
async createUser(createUserDTO: CreateUserDTO): Promise<UserDTO> {
  const user = User.create(createUserDTO);

  // Save to BOTH databases
  await this.defaultRepository.save(user);      // MongoDB
  await this.relationalRepository.save(user);   // MySQL

  return this.mapToDTO(user);
}
```

### Customizing Database Usage

You can easily customize which database to use for specific operations by modifying the service methods:

```typescript
// Read from MySQL instead of MongoDB
const user = await this.relationalRepository.findById(userId);

// Write to only one database
await this.mongoRepository.save(user);

// Or implement your own logic
if (needsRelationalIntegrity) {
  await this.mysqlRepository.save(user);
} else {
  await this.mongoRepository.save(user);
}
```

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

Example: Adding PostgreSQL support

1. Create new folder `src/infrastructure/persistence/postgres/`
2. Implement `PostgreSQLUserRepository` that implements `IUserRepository`
3. Add `PostgreSQLConnection` in `src/infrastructure/database/`
4. Register in DI container:
   ```typescript
   container
     .bind<IUserRepository>(TYPES.PostgreSQLUserRepository)
     .to(PostgreSQLUserRepository)
     .inSingletonScope();
   ```
5. Inject in service:
   ```typescript
   constructor(
     @inject(TYPES.PostgreSQLUserRepository) private postgresRepository: IUserRepository
   ) {}
   ```

No changes needed to the domain layer or existing repositories!

## Benefits of This Architecture

1. **Testability**: Easy to mock repositories and test business logic
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Use multiple databases simultaneously or switch between them without changing business logic
4. **Scalability**: Add new databases or features without affecting existing code
5. **Domain Focus**: Business logic is independent of technical details
6. **Resilience**: Multi-database setup provides redundancy and fault tolerance
7. **Polyglot Persistence**: Use the right database for the right use case

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

### Core
- **TypeScript 5.3.3**: Type safety and better developer experience
- **Node.js**: JavaScript runtime
- **Express 4.18**: Fast, unopinionated web framework

### Database
- **MySQL2 3.6**: MySQL driver for Node.js
- **Mongoose 8.0**: MongoDB ODM with schema validation

### Architecture & Patterns
- **InversifyJS 6.0**: Dependency injection container for IoC
- **Reflect-metadata 0.2**: Decorator metadata for dependency injection

### Validation & Transformation
- **class-validator 0.14**: Declarative validation using decorators
- **class-transformer 0.5**: Transform plain objects to class instances

### Development Tools
- **ts-node-dev**: TypeScript execution with hot reload
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **dotenv**: Environment variable management

## What You'll Learn

By exploring this boilerplate, you'll understand:

- How to implement **Hexagonal Architecture** in a real-world application
- **Domain-Driven Design** principles and patterns
- **Repository Pattern** for database abstraction
- **Multi-Database Architecture** and polyglot persistence
- **Dependency Injection** with InversifyJS
- How to structure a TypeScript project for scalability
- Writing maintainable, testable, and flexible code
- SOLID principles in practice
- Dual-write pattern for data synchronization

## Use Cases

This boilerplate is perfect for:

- Building enterprise-grade APIs
- Projects requiring multiple database support
- Learning clean architecture patterns
- Starting a new TypeScript project with best practices
- Creating maintainable and testable codebases

## License

MIT

## Contributing

Contributions are welcome! This is a boilerplate project meant to be forked and customized for your needs.

## Author

Created by [Shawon Kanji](https://github.com/shawon-kanji)

---

Built with Hexagonal Architecture principles for maximum flexibility and maintainability.
