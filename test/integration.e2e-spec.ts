import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { UserRole } from '../src/modules/users/entities/user.entity';
import { OrderStatus } from '../src/modules/orders/entities/order.entity';

describe('E-commerce Integration (e2e)', () => {
  let app: INestApplication<App>;

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
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Complete E-commerce Workflow', () => {
    it('should handle complete customer journey', async () => {
      // 1. Create a customer
      const customerData = {
        email: 'customer@integration.test',
        firstName: 'Integration',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
      };

      const customerResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(customerData)
        .expect(201);

      const customer = customerResponse.body.data;
      expect(customer.id).toBeDefined();
      expect(customer.email).toBe(customerData.email);

      // 2. Create products
      const products = [
        {
          name: 'Integration Laptop',
          description: 'High-performance laptop for integration testing',
          price: 1299.99,
          category: 'electronics',
          stock: 10,
          isActive: true,
        },
        {
          name: 'Integration Mouse',
          description: 'Wireless mouse for integration testing',
          price: 49.99,
          category: 'electronics',
          stock: 25,
          isActive: true,
        },
      ];

      const createdProducts: any[] = [];
      for (const productData of products) {
        const productResponse = await request(app.getHttpServer())
          .post('/api/v1/products')
          .send(productData)
          .expect(201);
        createdProducts.push(productResponse.body.data);
      }

      // 3. Browse products
      const browseResponse = await request(app.getHttpServer())
        .get('/api/v1/products?category=electronics&sortBy=price&sortOrder=asc')
        .expect(200);

      expect(browseResponse.body.data.data.length).toBeGreaterThanOrEqual(2);
      expect(browseResponse.body.data.data[0].category).toBe('electronics');

      // 4. Get product categories
      const categoriesResponse = await request(app.getHttpServer())
        .get('/api/v1/products/categories')
        .expect(200);

      expect(categoriesResponse.body.data).toContain('electronics');

      // 5. Search for products
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/products?search=laptop')
        .expect(200);

      expect(searchResponse.body.data.data.some(p => 
        p.name.toLowerCase().includes('laptop')
      )).toBe(true);

      // 6. Create an order with multiple items
      const orderData = {
        userId: customer.id,
        items: [
          { productId: createdProducts[0].id, quantity: 1 },
          { productId: createdProducts[1].id, quantity: 2 },
        ],
        shippingAddress: '123 Integration Street, Test City, TC 12345',
      };

      const orderResponse = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send(orderData)
        .expect(201);

      const order = orderResponse.body.data;
      expect(order.id).toBeDefined();
      expect(order.userId).toBe(customer.id);
      expect(order.items.length).toBe(2);
      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.totalAmount).toBe(
        createdProducts[0].price * 1 + createdProducts[1].price * 2
      );

      // 7. Verify stock was reduced
      for (let i = 0; i < createdProducts.length; i++) {
        const productResponse = await request(app.getHttpServer())
          .get(`/api/v1/products/${createdProducts[i].id}`)
          .expect(200);

        const expectedStock = products[i].stock - orderData.items[i].quantity;
        expect(productResponse.body.data.stock).toBe(expectedStock);
      }

      // 8. Get customer's orders
      const customerOrdersResponse = await request(app.getHttpServer())
        .get(`/api/v1/orders?userId=${customer.id}`)
        .expect(200);

      expect(customerOrdersResponse.body.data.length).toBe(1);
      expect(customerOrdersResponse.body.data[0].id).toBe(order.id);

      // 9. Process the order through different statuses
      const statuses = [
        OrderStatus.CONFIRMED,
        OrderStatus.PROCESSING,
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
      ];

      for (const status of statuses) {
        const statusResponse = await request(app.getHttpServer())
          .patch(`/api/v1/orders/${order.id}`)
          .send({ status })
          .expect(200);

        expect(statusResponse.body.data.status).toBe(status);
      }

      // 10. Verify final order status
      const finalOrderResponse = await request(app.getHttpServer())
        .get(`/api/v1/orders/${order.id}`)
        .expect(200);

      expect(finalOrderResponse.body.data.status).toBe(OrderStatus.DELIVERED);

      // 11. Update customer information
      const updateCustomerData = {
        firstName: 'Updated Integration',
        lastName: 'Updated Customer',
      };

      const updatedCustomerResponse = await request(app.getHttpServer())
        .patch(`/api/v1/users/${customer.id}`)
        .send(updateCustomerData)
        .expect(200);

      expect(updatedCustomerResponse.body.data.firstName).toBe(updateCustomerData.firstName);
      expect(updatedCustomerResponse.body.data.lastName).toBe(updateCustomerData.lastName);

      // 12. Update product information
      const updateProductData = {
        name: 'Updated Integration Laptop',
        price: 1399.99,
      };

      const updatedProductResponse = await request(app.getHttpServer())
        .patch(`/api/v1/products/${createdProducts[0].id}`)
        .send(updateProductData)
        .expect(200);

      expect(updatedProductResponse.body.data.name).toBe(updateProductData.name);
      expect(updatedProductResponse.body.data.price).toBe(updateProductData.price);
    });

    it('should handle order cancellation workflow', async () => {
      // 1. Create customer and product
      const customerResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          email: 'cancel.customer@test.com',
          firstName: 'Cancel',
          lastName: 'Customer',
        })
        .expect(201);

      const productResponse = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Cancellation Test Product',
          description: 'Product for testing cancellation',
          price: 99.99,
          category: 'test',
          stock: 5,
          isActive: true,
        })
        .expect(201);

      const customer = customerResponse.body.data;
      const product = productResponse.body.data;

      // 2. Create order
      const orderResponse = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          userId: customer.id,
          items: [{ productId: product.id, quantity: 2 }],
          shippingAddress: '123 Cancel Street',
        })
        .expect(201);

      const order = orderResponse.body.data;

      // 3. Verify stock was reduced
      const stockAfterOrderResponse = await request(app.getHttpServer())
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      expect(stockAfterOrderResponse.body.data.stock).toBe(3); // 5 - 2

      // 4. Cancel the order
      const cancelResponse = await request(app.getHttpServer())
        .patch(`/api/v1/orders/${order.id}/cancel`)
        .expect(200);

      expect(cancelResponse.body.data.status).toBe(OrderStatus.CANCELLED);

      // 5. Verify stock was restored
      const stockAfterCancelResponse = await request(app.getHttpServer())
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      expect(stockAfterCancelResponse.body.data.stock).toBe(5); // Back to original
    });

    it('should handle stock management correctly', async () => {
      // 1. Create product with limited stock
      const productResponse = await request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'Limited Stock Product',
          description: 'Product with limited stock',
          price: 199.99,
          category: 'limited',
          stock: 3,
          isActive: true,
        })
        .expect(201);

      const product = productResponse.body.data;

      // 2. Create customer
      const customerResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          email: 'stock.customer@test.com',
          firstName: 'Stock',
          lastName: 'Customer',
        })
        .expect(201);

      const customer = customerResponse.body.data;

      // 3. Try to order more than available stock
      const invalidOrderResponse = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          userId: customer.id,
          items: [{ productId: product.id, quantity: 5 }],
          shippingAddress: '123 Stock Street',
        })
        .expect(400);

      expect(invalidOrderResponse.body.message).toContain('Insufficient stock');

      // 4. Order available stock
      const validOrderResponse = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          userId: customer.id,
          items: [{ productId: product.id, quantity: 2 }],
          shippingAddress: '123 Stock Street',
        })
        .expect(201);

      // 5. Verify remaining stock
      const stockResponse = await request(app.getHttpServer())
        .get(`/api/v1/products/${product.id}`)
        .expect(200);

      expect(stockResponse.body.data.stock).toBe(1);

      // 6. Try to order remaining stock + 1 (should fail)
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          userId: customer.id,
          items: [{ productId: product.id, quantity: 2 }],
          shippingAddress: '123 Stock Street',
        })
        .expect(400);

      // 7. Update stock manually
      const stockUpdateResponse = await request(app.getHttpServer())
        .patch(`/api/v1/products/${product.id}/stock`)
        .send({ quantity: 5 })
        .expect(200);

      expect(stockUpdateResponse.body.data.stock).toBe(6); // 1 + 5

      // 8. Now the order should succeed
      await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          userId: customer.id,
          items: [{ productId: product.id, quantity: 2 }],
          shippingAddress: '123 Stock Street',
        })
        .expect(201);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle cascading validation errors', async () => {
      // Try to create order with invalid user and product
      const invalidOrderResponse = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .send({
          userId: 'invalid-user-id',
          items: [{ productId: 'invalid-product-id', quantity: 1 }],
          shippingAddress: '123 Test Street',
        })
        .expect(404);

      expect(invalidOrderResponse.body.statusCode).toBe(404);
      expect(invalidOrderResponse.body.message).toContain('not found');
    });

    it('should handle duplicate email validation', async () => {
      const userData = {
        email: 'duplicate@test.com',
        firstName: 'First',
        lastName: 'User',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const duplicateResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          ...userData,
          firstName: 'Second',
          lastName: 'User',
        })
        .expect(409);

      expect(duplicateResponse.body.statusCode).toBe(409);
      expect(duplicateResponse.body.message).toContain('already exists');
    });
  });
});