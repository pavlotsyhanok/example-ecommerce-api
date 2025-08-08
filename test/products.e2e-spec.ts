import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { testProducts } from './fixtures/test-data';
import { Product } from '../src/modules/products/entities/product.entity';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let createdProducts: Product[] = [];

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

    // Create test products
    createdProducts = [];
    for (const productData of testProducts) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(productData)
        .expect(201);
      createdProducts.push(response.body.data);
    }
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/products', () => {
    it('should return paginated products', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('limit');
      expect(response.body.data).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });

    it('should filter products by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products?category=electronics')
        .expect(200);

      expect(response.body.data.data.every(p => p.category === 'electronics')).toBe(true);
    });

    it('should search products by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products?search=laptop')
        .expect(200);

      expect(response.body.data.data.some(p => 
        p.name.toLowerCase().includes('laptop') || 
        p.description.toLowerCase().includes('laptop')
      )).toBe(true);
    });

    it('should filter products by price range', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products?minPrice=100&maxPrice=500')
        .expect(200);

      expect(response.body.data.data.every(p => p.price >= 100 && p.price <= 500)).toBe(true);
    });

    it('should filter active products only', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products?isActive=true')
        .expect(200);

      expect(response.body.data.data.every(p => p.isActive === true)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products?page=1&limit=2')
        .expect(200);

      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(2);
      expect(response.body.data.data.length).toBeLessThanOrEqual(2);
    });

    it('should support sorting', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products?sortBy=price&sortOrder=asc')
        .expect(200);

      const prices = response.body.data.data.map(p => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });
  });

  describe('GET /api/v1/products/categories', () => {
    it('should return list of categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/categories')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data).toContain('electronics');
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return a specific product', async () => {
      const productId = createdProducts[0].id;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .expect(200);

      expect(response.body.data.id).toBe(productId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('price');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('category');
      expect(response.body.data).toHaveProperty('stock');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/products/non-existent-id')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Test Product',
        description: 'A brand new test product',
        price: 99.99,
        category: 'test',
        stock: 15,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(newProduct)
        .expect(201);

      expect(response.body.data).toMatchObject(newProduct);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidProduct = {
        name: '',
        price: -10,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.length).toBeGreaterThan(0);
    });

    it('should validate price is positive', async () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'Test description',
        price: -10,
        category: 'test',
        stock: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('price must be a positive number'))).toBe(true);
    });

    it('should validate stock is non-negative', async () => {
      const invalidProduct = {
        name: 'Test Product',
        description: 'Test description',
        price: 99.99,
        category: 'test',
        stock: -5,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(invalidProduct)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('stock must not be less than 0'))).toBe(true);
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    it('should update a product', async () => {
      const productId = createdProducts[0].id;
      const updateData = {
        name: 'Updated Product Name',
        price: 199.99,
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.id).toBe(productId);
    });

    it('should return 404 for non-existent product', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app.getHttpServer())
        .patch('/api/v1/products/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PATCH /api/v1/products/:id/stock', () => {
    it('should update product stock', async () => {
      const productId = createdProducts[0].id;
      const originalStock = createdProducts[0].stock;
      const stockChange = 5;

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: stockChange })
        .expect(200);

      expect(response.body.data.stock).toBe(originalStock + stockChange);
    });

    it('should prevent negative stock', async () => {
      const productId = createdProducts[0].id;
      const originalStock = createdProducts[0].stock;
      const stockChange = -(originalStock + 10); // More than available

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/products/${productId}/stock`)
        .send({ quantity: stockChange })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('Insufficient stock');
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product', async () => {
      const productId = createdProducts[0].id;

      await request(app.getHttpServer())
        .delete(`/api/v1/products/${productId}`)
        .expect(204);

      // Verify product is deleted
      await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .expect(404);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/products/non-existent-id')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });
});