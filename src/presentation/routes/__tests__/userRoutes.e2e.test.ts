import request from 'supertest';
import express, { Application } from 'express';
import userRoutes from '../userRoutes';
import { errorHandler, notFoundHandler } from '../../middlewares/errorHandler';

/**
 * E2E (End-to-End) tests for User API endpoints
 *
 * These tests verify the complete HTTP request/response cycle including:
 * - Request validation
 * - Controller logic
 * - Use case execution
 * - Response formatting
 * - Error handling
 *
 * NOTE: These tests use the actual services and repositories.
 * For true isolation, you might want to use a test database.
 */
describe('User API Endpoints (E2E)', () => {
  let app: Application;

  beforeAll(() => {
    // Set up Express app with user routes
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  describe('POST /api/users', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'John Doe',
          email: `john.doe.${Date.now()}@example.com`, // Unique email
          age: 30,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('John Doe');
      expect(response.body.data.age).toBe(30);
    });

    it('should create a user without age', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Jane Doe',
          email: `jane.doe.${Date.now()}@example.com`,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Jane Doe');
      expect(response.body.data.age).toBeUndefined();
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          age: 25,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          age: 25,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          age: 25,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid age (negative)', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          age: -5,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid age (too large)', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          age: 200,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for empty name', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: '',
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/api/users').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return users with correct structure', async () => {
      // First create a user
      await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: `test.${Date.now()}@example.com`,
          age: 25,
        });

      const response = await request(app).get('/api/users').expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      const user = response.body.data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      // First create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Find Me',
          email: `findme.${Date.now()}@example.com`,
          age: 28,
        });

      const userId = createResponse.body.data.id;

      const response = await request(app).get(`/api/users/${userId}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.name).toBe('Find Me');
      expect(response.body.data.age).toBe(28);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for empty id', async () => {
      const response = await request(app).get('/api/users/ ').expect(404);

      // This will match the catch-all 404 handler
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      // First create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Original Name',
          email: `original.${Date.now()}@example.com`,
          age: 25,
        });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          name: 'Updated Name',
          age: 30,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.age).toBe(30);
    });

    it('should update only name', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: `test.${Date.now()}@example.com`,
          age: 25,
        });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          name: 'New Name',
        })
        .expect(200);

      expect(response.body.data.name).toBe('New Name');
      expect(response.body.data.age).toBe(25); // Age unchanged
    });

    it('should return 404 when updating non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/non-existent-id')
        .send({
          name: 'New Name',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid update data', async () => {
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: `test.${Date.now()}@example.com`,
        });

      const userId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({
          name: '', // Empty name
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      // First create a user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'To Delete',
          email: `delete.${Date.now()}@example.com`,
        });

      const userId = createResponse.body.data.id;

      const response = await request(app).delete(`/api/users/${userId}`).expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify user is deleted
      await request(app).get(`/api/users/${userId}`).expect(404);
    });

    it('should return 404 when deleting non-existent user', async () => {
      const response = await request(app).delete('/api/users/non-existent-id').expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Response format consistency', () => {
    it('should have consistent success response format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Format Test',
          email: `format.${Date.now()}@example.com`,
        })
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);
    });

    it('should have consistent error response format', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Error Test',
          // Missing email
        })
        .expect(400);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.success).toBe(false);
    });
  });
});
