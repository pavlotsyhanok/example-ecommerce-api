import { Injectable } from '@nestjs/common';
import { Product } from './product.interface';
import { Category } from './category.interface';
import { DatabaseService } from './database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getProducts(): Product[] {
    return this.databaseService.getProducts();
  }

  getCategories(): Category[] {
    return this.databaseService.getCategories();
  }
}
