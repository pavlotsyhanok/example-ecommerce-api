import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsUrl, Min, Max, IsEnum } from 'class-validator';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Wireless Bluetooth Headphones',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the product',
    example: 'High-quality wireless Bluetooth headphones with noise cancellation and 30-hour battery life',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price of the product in cents (to avoid floating point issues)',
    example: 9999,
    minimum: 0,
    maximum: 999999999,
  })
  @IsNumber()
  @Min(0)
  @Max(999999999)
  price: number;

  @ApiProperty({
    description: 'Stock quantity available',
    example: 50,
    minimum: 0,
    maximum: 999999,
  })
  @IsNumber()
  @Min(0)
  @Max(999999)
  stock: number;

  @ApiProperty({
    description: 'Product category ID',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  categoryId: number;

  @ApiProperty({
    description: 'SKU (Stock Keeping Unit) - unique product identifier',
    example: 'WBH-001-BLK',
    maxLength: 100,
  })
  @IsString()
  sku: string;

  @ApiProperty({
    description: 'Array of product image URLs',
    example: [
      'https://example.com/images/headphones-1.jpg',
      'https://example.com/images/headphones-2.jpg'
    ],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiProperty({
    description: 'Product weight in grams',
    example: 250,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({
    description: 'Product dimensions in format "length x width x height" (cm)',
    example: '20 x 15 x 8',
    required: false,
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    default: ProductStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({
    description: 'Array of product tags for search and categorization',
    example: ['electronics', 'audio', 'wireless', 'bluetooth'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
