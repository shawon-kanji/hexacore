# Testing Guide

This directory contains all test files for the HexaCore project. We follow a comprehensive testing strategy with unit tests, integration tests, and end-to-end (E2E) tests.

## Test Structure

```
src/
├── __tests__/
│   ├── factories/         # Test data factories
│   │   └── UserFactory.ts # Factory for creating User test data
│   ├── helpers/           # Test utilities
│   │   └── testHelpers.ts # Common test helper functions
│   └── mocks/             # Mock implementations
│       └── MockUserRepository.ts # In-memory repository for testing
├── application/use-cases/users/__tests__/  # Unit tests for use cases
├── infrastructure/persistence/**/__tests__/ # Integration tests for repositories
└── presentation/routes/__tests__/          # E2E tests for API endpoints
```

## Test Types

### 1. Unit Tests
**Location:** `src/application/use-cases/**/__tests__/*.test.ts`

Unit tests verify individual use cases in isolation using mock repositories.

**Coverage:**
- CreateUserUseCase ✓ (8 tests)
- GetUserByIdUseCase ✓ (5 tests)
- GetAllUsersUseCase ✓ (6 tests)
- UpdateUserUseCase ✓ (13 tests)
- DeleteUserUseCase ✓ (7 tests)

**Run unit tests:**
```bash
yarn test           # Run all unit tests
yarn test:watch     # Run tests in watch mode
yarn test:coverage  # Run with coverage report
```

### 2. Integration Tests
**Location:** `src/infrastructure/persistence/**/__tests__/*.integration.test.ts`

Integration tests verify repository implementations against real databases.

**NOTE:** Integration tests require database setup and are skipped by default.

**Run integration tests:**
```bash
# Set up test database first, then:
DATABASE_URL="your-test-db-url" yarn test:integration
```

### 3. E2E (End-to-End) Tests
**Location:** `src/presentation/routes/__tests__/*.e2e.test.ts`

E2E tests verify complete API endpoints including request validation, controller logic, and response formatting.

**NOTE:** E2E tests use actual services and repositories, and are skipped by default.

**Run E2E tests:**
```bash
# Ensure databases are running, then:
yarn test:e2e
```

## Running Tests

### Run All Tests (Unit tests only)
```bash
yarn test
```

### Run Specific Test File
```bash
yarn test CreateUserUseCase
yarn test UserController
```

### Run Tests in Watch Mode
```bash
yarn test:watch
```

### Run Tests with Coverage
```bash
yarn test:coverage
```

Coverage reports are generated in the `coverage/` directory. Open `coverage/index.html` in a browser to view detailed coverage.

### Run All Test Types
```bash
yarn test:unit          # Unit tests only
yarn test:integration   # Integration tests only
yarn test:e2e           # E2E tests only
```

## Test Utilities

### Factories
Factories create test data for consistent test setup:

```typescript
import { UserFactory } from '../../../__tests__/factories/UserFactory';

// Create a valid user with default data
const user = UserFactory.createValidUser();

// Create a user with custom data
const customUser = UserFactory.createValidUser({
  name: 'Custom Name',
  email: 'custom@example.com',
  age: 30,
});

// Reconstitute a user with specific ID
const existingUser = UserFactory.reconstitute({
  id: 'test-id-123',
  name: 'John Doe',
});

// Create multiple users
const users = UserFactory.createMultipleUsers(5);
```

### Mock Repositories
Mock repositories provide in-memory storage for isolated testing:

```typescript
import { MockUserRepository } from '../../../__tests__/mocks/MockUserRepository';

const mockRepo = new MockUserRepository();

// Seed with test data
mockRepo.seed([user1, user2, user3]);

// Clear all data
mockRepo.clear();

// Get count
const count = mockRepo.count();
```

### Test Helpers
Common test utilities for controllers and async operations:

```typescript
import { mockResponse, getAsyncErrorMessage } from '../../../__tests__/helpers/testHelpers';

// Create mock Express response
const res = mockResponse();

// Get error message from async function
const errorMsg = await getAsyncErrorMessage(async () => {
  throw new Error('Test error');
});
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to set up fresh state
- Use `afterEach` to clean up

```typescript
beforeEach(() => {
  mockRepository = new MockUserRepository();
});

afterEach(() => {
  mockRepository.clear();
});
```

### 2. Descriptive Test Names
Use clear, descriptive test names that explain what is being tested:

```typescript
it('should throw error when user with email already exists', async () => {
  // ...
});
```

### 3. Arrange-Act-Assert Pattern
```typescript
it('should create a new user successfully', async () => {
  // Arrange
  const createUserDTO = { name: 'John', email: 'john@example.com' };

  // Act
  const result = await useCase.execute(createUserDTO);

  // Assert
  expect(result.name).toBe('John');
});
```

### 4. Test Both Success and Error Cases
Always test:
- Happy path (success scenarios)
- Error cases (validation errors, not found, conflicts)
- Edge cases (empty data, boundary values)

## Coverage Goals

- **Use Cases:** 100% coverage (achieved ✓)
- **Domain Entities:** 90%+ coverage
- **Repositories:** 80%+ coverage (integration tests)
- **Controllers:** 80%+ coverage (E2E tests)
- **Overall Project:** 70%+ coverage

## Current Test Statistics

```
Test Suites: 5 passed, 5 total
Tests:       39 passed, 39 total
Coverage:    Use Cases 100%, Overall 32%
```

## Adding New Tests

### 1. Unit Test for Use Case
Create a test file next to the use case:

```typescript
// src/application/use-cases/users/__tests__/NewUseCase.test.ts
import { NewUseCase } from '../NewUseCase';
import { MockUserRepository } from '../../../../__tests__/mocks/MockUserRepository';

describe('NewUseCase', () => {
  let useCase: NewUseCase;
  let mockRepo: MockUserRepository;

  beforeEach(() => {
    mockRepo = new MockUserRepository();
    useCase = new NewUseCase(mockRepo);
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

### 2. Integration Test for Repository
```typescript
// src/infrastructure/persistence/mysql/__tests__/NewRepository.integration.test.ts
describe('NewRepository Integration Tests', () => {
  // Remember to clean database before/after tests
});
```

### 3. E2E Test for API Endpoint
```typescript
// src/presentation/routes/__tests__/newRoutes.e2e.test.ts
import request from 'supertest';

describe('New API Endpoints (E2E)', () => {
  it('should handle POST request', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' })
      .expect(200);
  });
});
```

## Troubleshooting

### Tests fail with database connection errors
- Ensure databases (MySQL, MongoDB) are running
- Check DATABASE_URL and MONGODB_URI in .env
- For unit tests, this shouldn't happen (they use mocks)

### Coverage report not generating
```bash
# Clean and regenerate
rm -rf coverage/
yarn test:coverage
```

### Tests are slow
- Unit tests should be fast (< 1s per test)
- If slow, check for unintended database calls
- Use `yarn test:unit` to skip integration tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
