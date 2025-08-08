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
import { CreateCategoryDto } from '../dto/create-category.dto';

export class CategoryResponseDto {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  parentId: number | null;
  parentName: string | null;
  imageUrl: string | null;
  icon: string | null;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  children: CategoryResponseDto[];
  createdAt: string;
  updatedAt: string;
}

@ApiTags('categories')
@Controller('categories')
@ApiProduces('application/json')
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  @Post()
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new product category. Requires admin or moderator privileges.',
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category data for creation',
    examples: {
      mainCategory: {
        summary: 'Main Category',
        description: 'Example of creating a main category',
        value: {
          name: 'Electronics',
          description: 'Electronic devices and accessories including smartphones, laptops, headphones, and more',
          slug: 'electronics',
          imageUrl: 'https://example.com/images/categories/electronics.jpg',
          icon: 'fas fa-laptop',
          sortOrder: 1,
          metaTitle: 'Electronics - Best Deals on Electronic Devices',
          metaDescription: 'Shop the latest electronics including smartphones, laptops, headphones, and more. Free shipping on orders over $50.',
          isActive: true,
          isFeatured: true
        }
      },
      subcategory: {
        summary: 'Subcategory',
        description: 'Example of creating a subcategory',
        value: {
          name: 'Smartphones',
          description: 'Latest smartphones from top brands',
          slug: 'smartphones',
          parentId: 1,
          imageUrl: 'https://example.com/images/categories/smartphones.jpg',
          icon: 'fas fa-mobile-alt',
          sortOrder: 1,
          isActive: true,
          isFeatured: false
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, validation errors, or slug already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - admin or moderator role required',
  })
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieves a list of categories with optional filtering and hierarchical structure.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories (admin/moderator only)',
    example: false,
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    type: Number,
    description: 'Filter categories by parent ID (null for root categories)',
    example: 1,
  })
  @ApiQuery({
    name: 'featured',
    required: false,
    type: Boolean,
    description: 'Filter featured categories only',
    example: true,
  })
  @ApiQuery({
    name: 'includeChildren',
    required: false,
    type: Boolean,
    description: 'Include child categories in the response',
    example: true,
  })
  @ApiQuery({
    name: 'includeProductCount',
    required: false,
    type: Boolean,
    description: 'Include product count for each category',
    example: true,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'sortOrder', 'createdAt', 'productCount'],
    description: 'Field to sort by',
    example: 'sortOrder',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
    example: 'asc',
  })
  @ApiOkResponse({
    description: 'Categories retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/CategoryResponseDto' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  findAll(
    @Query('includeInactive') includeInactive?: boolean,
    @Query('parentId') parentId?: number,
    @Query('featured') featured?: boolean,
    @Query('includeChildren') includeChildren?: boolean,
    @Query('includeProductCount') includeProductCount?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<CategoryResponseDto[]> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get('tree')
  @ApiOperation({
    summary: 'Get category tree',
    description: 'Retrieves the complete category hierarchy as a tree structure.',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories (admin/moderator only)',
    example: false,
  })
  @ApiQuery({
    name: 'maxDepth',
    required: false,
    type: Number,
    description: 'Maximum depth of the tree (default: unlimited)',
    example: 3,
  })
  @ApiOkResponse({
    description: 'Category tree retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/CategoryResponseDto' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  getCategoryTree(
    @Query('includeInactive') includeInactive?: boolean,
    @Query('maxDepth') maxDepth?: number,
  ): Promise<CategoryResponseDto[]> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get('featured')
  @ApiOperation({
    summary: 'Get featured categories',
    description: 'Retrieves categories marked as featured for homepage display.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of featured categories to return',
    example: 6,
  })
  @ApiOkResponse({
    description: 'Featured categories retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/CategoryResponseDto' },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  getFeaturedCategories(@Query('limit') limit?: number): Promise<CategoryResponseDto[]> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieves a single category by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID',
    example: 1,
  })
  @ApiQuery({
    name: 'includeChildren',
    required: false,
    type: Boolean,
    description: 'Include child categories in the response',
    example: true,
  })
  @ApiQuery({
    name: 'includeProducts',
    required: false,
    type: Boolean,
    description: 'Include products in this category',
    example: false,
  })
  @ApiOkResponse({
    description: 'Category found and returned successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID format',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeChildren') includeChildren?: boolean,
    @Query('includeProducts') includeProducts?: boolean,
  ): Promise<CategoryResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get category by slug',
    description: 'Retrieves a single category by its URL-friendly slug.',
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Category slug',
    example: 'electronics',
  })
  @ApiQuery({
    name: 'includeChildren',
    required: false,
    type: Boolean,
    description: 'Include child categories in the response',
    example: true,
  })
  @ApiQuery({
    name: 'includeProducts',
    required: false,
    type: Boolean,
    description: 'Include products in this category',
    example: false,
  })
  @ApiOkResponse({
    description: 'Category found and returned successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid slug format',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  findBySlug(
    @Param('slug') slug: string,
    @Query('includeChildren') includeChildren?: boolean,
    @Query('includeProducts') includeProducts?: boolean,
  ): Promise<CategoryResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update category',
    description: 'Updates an existing category. Requires admin or moderator privileges.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID to update',
    example: 1,
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category data for update (partial update supported)',
    examples: {
      basicUpdate: {
        summary: 'Update Basic Information',
        description: 'Example of updating category name and description',
        value: {
          name: 'Consumer Electronics',
          description: 'Updated description for consumer electronics category'
        }
      },
      statusUpdate: {
        summary: 'Update Status and Visibility',
        description: 'Example of updating category status and featured flag',
        value: {
          isActive: true,
          isFeatured: false,
          sortOrder: 2
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, validation errors, or slug conflict',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - admin or moderator role required',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: Partial<CreateCategoryDto>,
  ): Promise<CategoryResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete category',
    description: 'Deletes a category. Requires admin privileges. Categories with products or subcategories cannot be deleted unless force flag is used.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID to delete',
    example: 1,
  })
  @ApiQuery({
    name: 'force',
    required: false,
    type: Boolean,
    description: 'Force delete category even if it has products or subcategories',
    example: false,
  })
  @ApiOkResponse({
    description: 'Category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Category deleted successfully' },
        deletedId: { type: 'number', example: 1 },
        affectedProducts: { type: 'number', example: 5 },
        affectedSubcategories: { type: 'number', example: 2 },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID format or category has dependencies',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - admin role required',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('force') force?: boolean,
  ): Promise<{ message: string; deletedId: number; affectedProducts: number; affectedSubcategories: number }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get(':id/products')
  @ApiOperation({
    summary: 'Get products in category',
    description: 'Retrieves all products belonging to a specific category with pagination.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID',
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of products per page',
    example: 20,
  })
  @ApiQuery({
    name: 'includeSubcategories',
    required: false,
    type: Boolean,
    description: 'Include products from subcategories',
    example: true,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'price', 'createdAt', 'rating'],
    description: 'Field to sort products by',
    example: 'name',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
    example: 'asc',
  })
  @ApiOkResponse({
    description: 'Category products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        category: { $ref: '#/components/schemas/CategoryResponseDto' },
        products: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProductResponseDto' },
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 45 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 20 },
                totalPages: { type: 'number', example: 3 },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid category ID format or query parameters',
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
  })
  getCategoryProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('includeSubcategories') includeSubcategories?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{ category: CategoryResponseDto; products: { data: any[]; meta: any } }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }
}
