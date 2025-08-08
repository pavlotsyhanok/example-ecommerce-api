import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../entities/product.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from '../dto';
import { PaginatedResult } from '../../../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const seedProducts = [
      {
        id: uuidv4(),
        name: 'MacBook Pro 14-inch',
        price: 1999.99,
        description: 'Apple MacBook Pro with M2 Pro chip, 16GB RAM, 512GB SSD',
        category: 'electronics',
        stock: 10,
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Wireless Bluetooth Headphones',
        price: 199.99,
        description:
          'Premium noise-canceling wireless headphones with 30-hour battery life',
        category: 'electronics',
        stock: 25,
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Classic Cotton T-Shirt',
        price: 29.99,
        description:
          'Comfortable 100% cotton t-shirt available in multiple colors',
        category: 'clothing',
        stock: 50,
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'The Art of Clean Code',
        price: 39.99,
        description:
          'A comprehensive guide to writing maintainable and readable code',
        category: 'books',
        stock: 15,
        isActive: true,
      },
      {
        id: uuidv4(),
        name: 'Running Sneakers',
        price: 129.99,
        description:
          'Lightweight running shoes with advanced cushioning technology',
        category: 'clothing',
        stock: 30,
        isActive: true,
      },
    ];

    this.products = seedProducts.map(product => new Product(product));
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    let filteredProducts = [...this.products];

    // Apply filters
    if (query.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === query.category!.toLowerCase(),
      );
    }

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm),
      );
    }

    if (query.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        product => product.price >= query.minPrice!,
      );
    }

    if (query.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(
        product => product.price <= query.maxPrice!,
      );
    }

    if (query.isActive !== undefined) {
      filteredProducts = filteredProducts.filter(
        product => product.isActive === query.isActive,
      );
    }

    // Apply sorting
    if (query.sortBy) {
      filteredProducts.sort((a, b) => {
        const aValue = (a as any)[query.sortBy!] || '';
        const bValue = (b as any)[query.sortBy!] || '';
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return query.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        }
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return query.sortOrder === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
      });
    }

    // Apply pagination
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / query.limit!);
    const paginatedProducts = filteredProducts.slice(
      query.skip,
      query.skip + query.limit!,
    );

    return {
      data: paginatedProducts,
      total,
      page: query.page!,
      limit: query.limit!,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new Product({
      id: uuidv4(),
      ...createProductDto,
    });

    this.products.push(product);
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const existingProduct = this.products[productIndex];
    const updatedProduct = new Product({
      ...existingProduct,
      ...updateProductDto,
    });
    updatedProduct.updateTimestamp();

    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    this.products.splice(productIndex, 1);
  }

  async getCategories(): Promise<string[]> {
    const categories = [...new Set(this.products.map(p => p.category))];
    return categories.sort();
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    
    if (product.stock + quantity < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.update(id, { stock: product.stock + quantity });
  }
}