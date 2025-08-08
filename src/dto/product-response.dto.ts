import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from './create-product.dto';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the product',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the product',
    example: 'Wireless Bluetooth Headphones',
  })
  name: string;

  @ApiProperty({
    description: 'Detailed description of the product',
    example: 'High-quality wireless Bluetooth headphones with noise cancellation and 30-hour battery life',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Price of the product in cents',
    example: 9999,
  })
  price: number;

  @ApiProperty({
    description: 'Formatted price for display (e.g., $99.99)',
    example: '$99.99',
  })
  formattedPrice: string;

  @ApiProperty({
    description: 'Stock quantity available',
    example: 50,
  })
  stock: number;

  @ApiProperty({
    description: 'Product category ID',
    example: 1,
  })
  categoryId: number;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  categoryName: string;

  @ApiProperty({
    description: 'SKU (Stock Keeping Unit) - unique product identifier',
    example: 'WBH-001-BLK',
  })
  sku: string;

  @ApiProperty({
    description: 'Array of product image URLs',
    example: [
      'https://example.com/images/headphones-1.jpg',
      'https://example.com/images/headphones-2.jpg'
    ],
    type: [String],
  })
  images: string[];

  @ApiProperty({
    description: 'Product weight in grams',
    example: 250,
    nullable: true,
  })
  weight: number | null;

  @ApiProperty({
    description: 'Product dimensions in format "length x width x height" (cm)',
    example: '20 x 15 x 8',
    nullable: true,
  })
  dimensions: string | null;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @ApiProperty({
    description: 'Array of product tags for search and categorization',
    example: ['electronics', 'audio', 'wireless', 'bluetooth'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Average rating from customer reviews (1-5 scale)',
    example: 4.5,
    minimum: 0,
    maximum: 5,
    nullable: true,
  })
  averageRating: number | null;

  @ApiProperty({
    description: 'Total number of reviews',
    example: 127,
  })
  reviewCount: number;

  @ApiProperty({
    description: 'Indicates if the product is currently in stock',
    example: true,
  })
  inStock: boolean;

  @ApiProperty({
    description: 'Date when the product was created',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Date when the product was last updated',
    example: '2024-01-20T14:45:00Z',
    format: 'date-time',
  })
  updatedAt: string;
}
