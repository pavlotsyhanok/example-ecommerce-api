import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto, ProductStatus } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';

@Injectable()
export class ProductsService {
  private products: ProductResponseDto[] = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless Bluetooth headphones with noise cancellation and 30-hour battery life',
      price: 9999,
      formattedPrice: '$99.99',
      stock: 50,
      categoryId: 1,
      categoryName: 'Electronics',
      sku: 'WBH-001-BLK',
      images: [
        'https://example.com/images/headphones-1.jpg',
        'https://example.com/images/headphones-2.jpg'
      ],
      weight: 250,
      dimensions: '20 x 15 x 8',
      status: ProductStatus.ACTIVE,
      tags: ['electronics', 'audio', 'wireless', 'bluetooth'],
      averageRating: 4.5,
      reviewCount: 127,
      inStock: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
    },
    {
      id: 2,
      name: 'Gaming Mechanical Keyboard',
      description: 'RGB backlit mechanical gaming keyboard with Cherry MX switches',
      price: 12999,
      formattedPrice: '$129.99',
      stock: 25,
      categoryId: 1,
      categoryName: 'Electronics',
      sku: 'GMK-002-RGB',
      images: [
        'https://example.com/images/keyboard-1.jpg',
        'https://example.com/images/keyboard-2.jpg'
      ],
      weight: 800,
      dimensions: '44 x 13 x 3',
      status: ProductStatus.ACTIVE,
      tags: ['electronics', 'gaming', 'keyboard', 'rgb'],
      averageRating: 4.8,
      reviewCount: 89,
      inStock: true,
      createdAt: '2024-01-10T08:15:00Z',
      updatedAt: '2024-01-18T16:20:00Z',
    },
    {
      id: 3,
      name: 'Smartphone Case',
      description: 'Protective smartphone case with shock absorption',
      price: 2499,
      formattedPrice: '$24.99',
      stock: 100,
      categoryId: 2,
      categoryName: 'Accessories',
      sku: 'SPC-003-BLU',
      images: [
        'https://example.com/images/case-1.jpg'
      ],
      weight: 50,
      dimensions: '16 x 8 x 1',
      status: ProductStatus.ACTIVE,
      tags: ['accessories', 'smartphone', 'protection'],
      averageRating: 4.2,
      reviewCount: 234,
      inStock: true,
      createdAt: '2024-01-05T12:00:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
    },
    {
      id: 4,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      price: 4999,
      formattedPrice: '$49.99',
      stock: 0,
      categoryId: 1,
      categoryName: 'Electronics',
      sku: 'WM-004-WHT',
      images: [
        'https://example.com/images/mouse-1.jpg'
      ],
      weight: 120,
      dimensions: '12 x 6 x 4',
      status: ProductStatus.OUT_OF_STOCK,
      tags: ['electronics', 'mouse', 'wireless'],
      averageRating: 4.0,
      reviewCount: 56,
      inStock: false,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-22T11:15:00Z',
    },
  ];

  private nextId = 5;

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // Check if SKU already exists
    const existingSku = this.products.find(p => p.sku === createProductDto.sku);
    if (existingSku) {
      throw new BadRequestException('Product with this SKU already exists');
    }

    const newProduct: ProductResponseDto = {
      id: this.nextId++,
      name: createProductDto.name,
      description: createProductDto.description || null,
      price: createProductDto.price,
      formattedPrice: this.formatPrice(createProductDto.price),
      stock: createProductDto.stock,
      categoryId: createProductDto.categoryId,
      categoryName: this.getCategoryName(createProductDto.categoryId),
      sku: createProductDto.sku,
      images: createProductDto.images || [],
      weight: createProductDto.weight || null,
      dimensions: createProductDto.dimensions || null,
      status: createProductDto.status || ProductStatus.ACTIVE,
      tags: createProductDto.tags || [],
      averageRating: null,
      reviewCount: 0,
      inStock: createProductDto.stock > 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.push(newProduct);
    return newProduct;
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
  }): Promise<{ data: ProductResponseDto[]; meta: any }> {
    let filteredProducts = [...this.products];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters.minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
    }

    if (filters.status) {
      filteredProducts = filteredProducts.filter(p => p.status === filters.status);
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredProducts.sort((a, b) => {
        let aValue = a[filters.sortBy];
        let bValue = b[filters.sortBy];

        if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      meta: {
        total: filteredProducts.length,
        page,
        limit,
        totalPages: Math.ceil(filteredProducts.length / limit),
      },
    };
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check if SKU already exists (if being updated)
    if (updateProductDto.sku) {
      const existingSku = this.products.find(p => p.sku === updateProductDto.sku && p.id !== id);
      if (existingSku) {
        throw new BadRequestException('Product with this SKU already exists');
      }
    }

    const existingProduct = this.products[productIndex];
    const updatedProduct: ProductResponseDto = {
      ...existingProduct,
      ...updateProductDto,
      formattedPrice: updateProductDto.price ? this.formatPrice(updateProductDto.price) : existingProduct.formattedPrice,
      categoryName: updateProductDto.categoryId ? this.getCategoryName(updateProductDto.categoryId) : existingProduct.categoryName,
      inStock: updateProductDto.stock !== undefined ? updateProductDto.stock > 0 : existingProduct.inStock,
      updatedAt: new Date().toISOString(),
    };

    this.products[productIndex] = updatedProduct;
    return updatedProduct;
  }

  async remove(id: number): Promise<{ message: string; deletedId: number }> {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Soft delete - mark as inactive instead of removing
    this.products[productIndex].status = ProductStatus.INACTIVE;
    this.products[productIndex].updatedAt = new Date().toISOString();

    return {
      message: 'Product deleted successfully',
      deletedId: id,
    };
  }

  async findRelated(id: number, limit: number = 5): Promise<ProductResponseDto[]> {
    const product = await this.findOne(id);
    
    // Find related products based on category and tags
    const relatedProducts = this.products
      .filter(p => 
        p.id !== id && 
        p.status === ProductStatus.ACTIVE &&
        (p.categoryId === product.categoryId || 
         p.tags.some(tag => product.tags.includes(tag)))
      )
      .slice(0, limit);

    return relatedProducts;
  }

  private formatPrice(priceInCents: number): string {
    return `$${(priceInCents / 100).toFixed(2)}`;
  }

  private getCategoryName(categoryId: number): string {
    // Mock category mapping
    const categories = {
      1: 'Electronics',
      2: 'Accessories',
      3: 'Clothing',
      4: 'Home & Garden',
      5: 'Sports & Outdoors',
    };
    return categories[categoryId] || 'Unknown Category';
  }
}
