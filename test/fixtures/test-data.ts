import { CreateProductDto } from '../../src/modules/products/dto';
import { CreateUserDto } from '../../src/modules/users/dto';
import { CreateOrderDto } from '../../src/modules/orders/dto';
import { UserRole } from '../../src/modules/users/entities/user.entity';

export const testProducts: CreateProductDto[] = [
  {
    name: 'Test Laptop',
    description: 'A high-performance laptop for testing',
    price: 999.99,
    category: 'electronics',
    stock: 5,
    isActive: true,
  },
  {
    name: 'Test Headphones',
    description: 'Premium wireless headphones for testing',
    price: 199.99,
    category: 'electronics',
    stock: 10,
    isActive: true,
  },
  {
    name: 'Test T-Shirt',
    description: 'Comfortable cotton t-shirt for testing',
    price: 29.99,
    category: 'clothing',
    stock: 20,
    isActive: true,
  },
  {
    name: 'Inactive Product',
    description: 'This product is inactive',
    price: 49.99,
    category: 'test',
    stock: 0,
    isActive: false,
  },
];

export const testUsers: CreateUserDto[] = [
  {
    email: 'test.admin@example.com',
    firstName: 'Test',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    isActive: true,
  },
  {
    email: 'test.customer@example.com',
    firstName: 'Test',
    lastName: 'Customer',
    role: UserRole.CUSTOMER,
    isActive: true,
  },
  {
    email: 'john.test@example.com',
    firstName: 'John',
    lastName: 'Test',
    role: UserRole.CUSTOMER,
    isActive: true,
  },
];

export const createTestOrder = (userId: string, productId: string): CreateOrderDto => ({
  userId,
  items: [
    {
      productId,
      quantity: 2,
    },
  ],
  shippingAddress: '123 Test Street, Test City, TC 12345',
});