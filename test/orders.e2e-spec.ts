import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { testProducts, testUsers, createTestOrder } from './fixtures/test-data';
import { Product } from '../src/modules/products/entities/product.entity';
import { User } from '../src/modules/users/entities/user.entity';
import { Order, OrderStatus } from '../src/modules/orders/entities/order.entity';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let createdProducts: Product[] = [];
  let createdUsers: User[] = [];
  let createdOrders: Order[] = [];

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
    for (const productData of testProducts.slice(0, 3)) { // Only active products
      const response = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send(productData)
        .expect(201);
      createdProducts.push(response.body.data);
    }

    // Create test users
    createdUsers = [];
    for (const userData of testUsers) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(201);
      createdUsers.push(response.body.data);
    }

    // Create test orders
    createdOrders = [];
    const orderData = createTestOrder(createdUsers[1].id, createdProducts[0].id);
    const response = await request(app.getHttpServer())
      .post('/api/v1/orders')
      .send(orderData)
      .expect(201);
    createdOrders.push(response.body.data);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/orders', () => {
    it('should return list of orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter orders by userId', async () => {
      const userId = createdUsers[1].id;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders?userId=${userId}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every(order => order.userId === userId)).toBe(true);
    });

    it('should return orders with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders')
        .expect(200);

      const order = response.body.data[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('userId');
      expect(order).toHaveProperty('items');
      expect(order).toHaveProperty('totalAmount');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('shippingAddress');
      expect(order).toHaveProperty('orderNumber');
      expect(order).toHaveProperty('createdAt');
      expect(order).toHaveProperty('updatedAt');
      expect(Array.isArray(order.items)).toBe(true);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return a specific order', async () => {
      const orderId = createdOrders[0].id;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders/${orderId}`)
        .expect(200);

      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.userId).toBe(createdUsers[1].id);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/orders/non-existent-id')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/v1/orders', () => {
    it('should create a new order', async () => {
      const orderData = createTestOrder(createdUsers[0].id, createdProducts[1].id);

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.data.userId).toBe(orderData.userId);
      expect(response.body.data.shippingAddress).toBe(orderData.shippingAddress);
      expect(response.body.data.items.length).toBe(orderData.items.length);
      expect(response.body.data.status).toBe(OrderStatus.PENDING);
      expect(response.body.data.totalAmount).toBeGreaterThan(0);
      expect(response.body.data.orderNumber).toBeDefined();
      expect(response.body.data.id).toBeDefined();
    });

    it('should calculate total amount correctly', async () => {
      const product = createdProducts[0];
      const quantity = 3;
      const orderData = {
        userId: createdUsers[0].id,
        items: [{ productId: product.id, quantity }],
        shippingAddress: '123 Test Street',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(201);

      const expectedTotal = product.price * quantity;
      expect(response.body.data.totalAmount).toBe(expectedTotal);
      expect(response.body.data.items[0].unitPrice).toBe(product.price);
      expect(response.body.data.items[0].totalPrice).toBe(expectedTotal);
    });

    it('should update product stock when order is created', async () => {
      const product = createdProducts[2];
      const originalStock = product.stock;
      const quantity = 2;
      
      const orderData = {
        userId: createdUsers[0].id,
        items: [{ productId: product.id, quantity }],
        shippingAddress: '123 Test Street',
      };

      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(201);

      // Check that product stock was reduced
      const productResponse = await request(app.getHttpServer())
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      expect(productResponse.body.data.stock).toBe(originalStock - quantity);
    });

    it('should validate user exists', async () => {
      const orderData = createTestOrder('non-existent-user-id', createdProducts[0].id);

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should validate product exists', async () => {
      const orderData = createTestOrder(createdUsers[0].id, 'non-existent-product-id');

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should validate sufficient stock', async () => {
      const product = createdProducts[0];
      const orderData = {
        userId: createdUsers[0].id,
        items: [{ productId: product.id, quantity: product.stock + 10 }],
        shippingAddress: '123 Test Street',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('Insufficient stock');
    });

    it('should validate required fields', async () => {
      const invalidOrder = {
        userId: '',
        items: [],
        shippingAddress: '',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('should not be empty'))).toBe(true);
    });

    it('should validate items array is not empty', async () => {
      const invalidOrder = {
        userId: createdUsers[0].id,
        items: [],
        shippingAddress: '123 Test Street',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('items must contain at least 1 elements'))).toBe(true);
    });

    it('should validate positive quantity', async () => {
      const invalidOrder = {
        userId: createdUsers[0].id,
        items: [{ productId: createdProducts[0].id, quantity: 0 }],
        shippingAddress: '123 Test Street',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(invalidOrder)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message.some(msg => msg.includes('quantity must be a positive number'))).toBe(true);
    });
  });

  describe('PATCH /api/v1/orders/:id', () => {
    it('should update order status', async () => {
      const orderId = createdOrders[0].id;
      const updateData = { status: OrderStatus.CONFIRMED };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.status).toBe(OrderStatus.CONFIRMED);
      expect(response.body.data.id).toBe(orderId);
    });

    it('should validate status transitions', async () => {
      const orderId = createdOrders[0].id;
      
      // Try to transition from PENDING to DELIVERED (invalid)
      const updateData = { status: OrderStatus.DELIVERED };

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('Invalid status transition');
    });

    it('should return 404 for non-existent order', async () => {
      const updateData = { status: OrderStatus.CONFIRMED };

      const response = await request(app.getHttpServer())
        .patch('/api/v1/orders/non-existent-id')
        .send(updateData)
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PATCH /api/v1/orders/:id/cancel', () => {
    it('should cancel an order', async () => {
      const orderId = createdOrders[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/cancel`)
        .expect(200);

      expect(response.body.data.status).toBe(OrderStatus.CANCELLED);
    });

    it('should restore product stock when order is cancelled', async () => {
      // Create a new order to cancel
      const product = createdProducts[1];
      const quantity = 2;
      const orderData = {
        userId: createdUsers[0].id,
        items: [{ productId: product.id, quantity }],
        shippingAddress: '123 Test Street',
      };

      const orderResponse = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(201);

      const orderId = orderResponse.body.data.id;

      // Get current stock
      const productResponse1 = await request(app.getHttpServer())
        .get(`/api/v1/products/${product.id}`)
        .expect(200);
      const stockBeforeCancel = productResponse1.body.data.stock;

      // Cancel the order
      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/cancel`)
        .expect(200);

      // Check that stock was restored
      const productResponse2 = await request(app.getHttpServer())
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      expect(productResponse2.body.data.stock).toBe(stockBeforeCancel + quantity);
    });

    it('should not cancel a delivered order', async () => {
      const orderId = createdOrders[0].id;

      // First, update order to delivered status
      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send({ status: OrderStatus.CONFIRMED })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send({ status: OrderStatus.PROCESSING })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send({ status: OrderStatus.SHIPPED })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(200);

      // Now try to cancel
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/cancel`)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('Cannot cancel a delivered order');
    });

    it('should not cancel an already cancelled order', async () => {
      const orderId = createdOrders[0].id;

      // Cancel the order first
      await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/cancel`)
        .expect(200);

      // Try to cancel again
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}/cancel`)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('already cancelled');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/orders/non-existent-id/cancel')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('Order workflow', () => {
    it('should support complete order lifecycle', async () => {
      // Create order
      const orderData = createTestOrder(createdUsers[0].id, createdProducts[2].id);
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.data.id;
      expect(createResponse.body.data.status).toBe(OrderStatus.PENDING);

      // Confirm order
      const confirmResponse = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send({ status: OrderStatus.CONFIRMED })
        .expect(200);
      expect(confirmResponse.body.data.status).toBe(OrderStatus.CONFIRMED);

      // Process order
      const processResponse = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send({ status: OrderStatus.PROCESSING })
        .expect(200);
      expect(processResponse.body.data.status).toBe(OrderStatus.PROCESSING);

      // Ship order
      const shipResponse = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send({ status: OrderStatus.SHIPPED })
        .expect(200);
      expect(shipResponse.body.data.status).toBe(OrderStatus.SHIPPED);

      // Deliver order
      const deliverResponse = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${orderId}`)
        .send({ status: OrderStatus.DELIVERED })
        .expect(200);
      expect(deliverResponse.body.data.status).toBe(OrderStatus.DELIVERED);
    });
  });
});