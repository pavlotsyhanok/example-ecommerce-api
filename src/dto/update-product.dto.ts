import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsUrl, Min, Max, IsEnum } from 'class-validator';
import { CreateProductDto, ProductStatus } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Wireless Bluetooth Headphones Pro',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Detailed description of the product',
    example: 'Premium wireless Bluetooth headphones with advanced noise cancellation and 40-hour battery life',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Price of the product in cents',
    example: 12999,
    minimum: 0,
    maximum: 999999999,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999999)
  price?: number;

  @ApiProperty({
    description: 'Stock quantity available',
    example: 75,
    minimum: 0,
    maximum: 999999,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999)
  stock?: number;

  @ApiProperty({
    description: 'Product category ID',
    example: 2,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  categoryId?: number;

  @ApiProperty({
    description: 'SKU (Stock Keeping Unit) - unique product identifier',
    example: 'WBH-002-BLK',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    description: 'Array of product image URLs',
    example: [
      'https://example.com/images/headphones-pro-1.jpg',
      'https://example.com/images/headphones-pro-2.jpg',
      'https://example.com/images/headphones-pro-3.jpg'
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
    example: 280,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({
    description: 'Product dimensions in format "length x width x height" (cm)',
    example: '22 x 16 x 9',
    required: false,
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiProperty({
    description: 'Product status',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({
    description: 'Array of product tags for search and categorization',
    example: ['electronics', 'audio', 'wireless', 'bluetooth', 'premium'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
