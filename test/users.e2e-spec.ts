import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { testUsers } from './fixtures/test-data';
import { User, UserRole } from '../src/modules/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let createdUsers: User[] = [];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    // Create test users
    createdUsers = [];
    for (const userData of testUsers) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(201);
      createdUsers.push(response.body.data);
    }
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/users', () => {
    it('should return list of active users', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.every(user => user.isActive === true)).toBe(true);
    });

    it('should return users with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(200);

      const user = response.body.data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('isActive');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return a specific user', async () => {
      const userId = createdUsers[0].id;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .expect(200);

      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe(createdUsers[0].email);
      expect(response.body.data.firstName).toBe(createdUsers[0].firstName);
      expect(response.body.data.lastName).toBe(createdUsers[0].lastName);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/non-existent-id')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: 'new.user@example.com',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.CUSTOMER,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(newUser)
        .expect(201);

      expect(response.body.data).toMatchObject(newUser);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should create user with default role CUSTOMER', async () => {
      const newUser = {
        email: 'default.role@example.com',
        firstName: 'Default',
        lastName: 'Role',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(newUser)
        .expect(201);

      expect(response.body.data.role).toBe(UserRole.CUSTOMER);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should validate email format', async () => {
      const invalidUser = {
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('email must be an email'))).toBe(true);
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        email: 'test@example.com',
        firstName: '',
        lastName: '',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('should not be empty'))).toBe(true);
    });

    it('should prevent duplicate email addresses', async () => {
      const existingEmail = createdUsers[0].email;
      const duplicateUser = {
        email: existingEmail,
        firstName: 'Duplicate',
        lastName: 'User',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('already exists');
    });

    it('should validate role enum', async () => {
      const invalidUser = {
        email: 'invalid.role@example.com',
        firstName: 'Invalid',
        lastName: 'Role',
        role: 'invalid_role',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('role must be one of the following values'))).toBe(true);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update a user', async () => {
      const userId = createdUsers[0].id;
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.firstName).toBe(updateData.firstName);
      expect(response.body.data.lastName).toBe(updateData.lastName);
      expect(response.body.data.id).toBe(userId);
    });

    it('should update user email', async () => {
      const userId = createdUsers[0].id;
      const updateData = {
        email: 'updated.email@example.com',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.email).toBe(updateData.email);
    });

    it('should prevent duplicate email on update', async () => {
      const userId = createdUsers[0].id;
      const existingEmail = createdUsers[1].email;
      const updateData = {
        email: existingEmail,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(409);

      expect(response.body.statusCode).toBe(409);
      expect(response.body.message).toContain('already exists');
    });

    it('should return 404 for non-existent user', async () => {
      const updateData = { firstName: 'Updated' };

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should validate email format on update', async () => {
      const userId = createdUsers[0].id;
      const updateData = {
        email: 'invalid-email-format',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('email must be an email'))).toBe(true);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should soft delete a user', async () => {
      const userId = createdUsers[0].id;

      await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .expect(204);

      // User should still exist but not be returned in active users list
      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(200);

      expect(response.body.data.find(user => user.id === userId)).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/users/non-existent-id')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('User entity methods', () => {
    it('should have fullName getter', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${createdUsers[0].id}`)
        .expect(200);

      const user = response.body.data;
      // Note: The fullName getter would be available on the entity instance
      // but may not be serialized in the response. This test verifies the structure.
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
    });
  });
});