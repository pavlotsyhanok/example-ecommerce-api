import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Product } from './product.interface';
import { Category } from './category.interface';

interface Database {
  products: Product[];
  categories: Category[];
}

@Injectable()
export class DatabaseService {
  private database: Database;

  constructor() {
    this.loadDatabase();
  }

  private loadDatabase(): void {
    try {
      const databasePath = join(process.cwd(), 'database.json');
      const databaseContent = readFileSync(databasePath, 'utf8');
      this.database = JSON.parse(databaseContent);
    } catch (error) {
      console.error('Failed to load database:', error);
      // Fallback to empty database
      this.database = { products: [], categories: [] };
    }
  }

  getProducts(): Product[] {
    return this.database.products;
  }

  getProductById(id: number): Product | undefined {
    return this.database.products.find(product => product.id === id);
  }

  getCategories(): Category[] {
    return this.database.categories;
  }

  getCategoryByName(name: string): Category | undefined {
    return this.database.categories.find(category => category.name === name);
  }
}