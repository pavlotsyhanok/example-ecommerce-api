import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUrl, MinLength, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Electronics',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Detailed description of the category',
    example: 'Electronic devices and accessories including smartphones, laptops, headphones, and more',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'URL-friendly slug for the category (used in URLs)',
    example: 'electronics',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({
    description: 'Parent category ID (for subcategories)',
    example: null,
    minimum: 1,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  parentId?: number | null;

  @ApiProperty({
    description: 'Category image URL',
    example: 'https://example.com/images/categories/electronics.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Category icon URL or icon class name',
    example: 'fas fa-laptop',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiProperty({
    description: 'Sort order for displaying categories (lower numbers appear first)',
    example: 1,
    minimum: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({
    description: 'Meta title for SEO purposes',
    example: 'Electronics - Best Deals on Electronic Devices',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @ApiProperty({
    description: 'Meta description for SEO purposes',
    example: 'Shop the latest electronics including smartphones, laptops, headphones, and more. Free shipping on orders over $50.',
    maxLength: 300,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaDescription?: string;

  @ApiProperty({
    description: 'Indicates if the category is currently active and visible',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Indicates if the category should be featured on the homepage',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  isFeatured?: boolean;
}
