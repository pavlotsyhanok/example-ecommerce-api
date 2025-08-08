import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';

@ApiTags('products')
@Controller('products')
@ApiProduces('application/json')
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Creates a new product in the catalog. Requires admin or moderator privileges.',
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: CreateProductDto,
    description: 'Product data for creation',
    examples: {
      example1: {
        summary: 'Electronics Product',
        description: 'Example of creating an electronics product',
        value: {
          name: 'Wireless Bluetooth Headphones',
          description: 'High-quality wireless Bluetooth headphones with noise cancellation',
          price: 9999,
          stock: 50,
          categoryId: 1,
          sku: 'WBH-001-BLK',
          images: ['https://example.com/images/headphones-1.jpg'],
          weight: 250,
          dimensions: '20 x 15 x 8',
          status: 'active',
          tags: ['electronics', 'audio', 'wireless']
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Product successfully created',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - admin or moderator role required',
  })
  create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieves a paginated list of products with optional filtering and sorting.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter products by name or description',
    example: 'headphones',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Filter products by category ID',
    example: 1,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter (in cents)',
    example: 1000,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter (in cents)',
    example: 50000,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'price', 'createdAt', 'updatedAt', 'rating'],
    description: 'Field to sort by',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
    example: 'asc',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'out_of_stock'],
    description: 'Filter by product status',
    example: 'active',
  })
  @ApiOkResponse({
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 150 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 15 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: number,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('status') status?: string,
  ): Promise<{ data: ProductResponseDto[]; meta: any }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieves a single product by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Product found and returned successfully',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid product ID format',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update product',
    description: 'Updates an existing product. Requires admin or moderator privileges.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID to update',
    example: 1,
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: UpdateProductDto,
    description: 'Product data for update (partial update supported)',
    examples: {
      example1: {
        summary: 'Update Price and Stock',
        description: 'Example of updating product price and stock',
        value: {
          price: 8999,
          stock: 75
        }
      },
      example2: {
        summary: 'Update Product Details',
        description: 'Example of updating product name and description',
        value: {
          name: 'Premium Wireless Bluetooth Headphones',
          description: 'Premium wireless Bluetooth headphones with advanced noise cancellation and 40-hour battery life'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - admin or moderator role required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Deletes a product from the catalog. Requires admin privileges. This is a soft delete - the product will be marked as inactive.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID to delete',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Product deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Product deleted successfully' },
        deletedId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid product ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - admin role required',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; deletedId: number }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get(':id/related')
  @ApiOperation({
    summary: 'Get related products',
    description: 'Retrieves products related to the specified product based on category and tags.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID to find related products for',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of related products to return',
    example: 5,
  })
  @ApiOkResponse({
    description: 'Related products retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/ProductResponseDto' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid product ID format',
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  findRelated(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: number,
  ): Promise<ProductResponseDto[]> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }
}
