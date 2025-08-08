import { Injectable } from '@nestjs/common';
import { Product } from './product.interface';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'MacBook Pro 14-inch',
        price: 1999.99,
        description: 'Apple MacBook Pro with M2 Pro chip, 16GB RAM, 512GB SSD',
        category: 'electronics'
      },
      {
        id: 2,
        name: 'Wireless Bluetooth Headphones',
        price: 199.99,
        description: 'Premium noise-canceling wireless headphones with 30-hour battery life',
        category: 'electronics'
      },
      {
        id: 3,
        name: 'Classic Cotton T-Shirt',
        price: 29.99,
        description: 'Comfortable 100% cotton t-shirt available in multiple colors',
        category: 'clothing'
      },
      {
        id: 4,
        name: 'The Art of Clean Code',
        price: 39.99,
        description: 'A comprehensive guide to writing maintainable and readable code',
        category: 'books'
      },
      {
        id: 5,
        name: 'Running Sneakers',
        price: 129.99,
        description: 'Lightweight running shoes with advanced cushioning technology',
        category: 'clothing'
      }
    ];
  }
}


