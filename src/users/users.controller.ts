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
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@ApiTags('users')
@Controller('users')
@ApiProduces('application/json')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  @Post()
  @ApiOperation({
    summary: 'Create a new user account',
    description: 'Registers a new user in the system. This endpoint is typically used for user registration.',
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: CreateUserDto,
    description: 'User registration data',
    examples: {
      customer: {
        summary: 'Customer Registration',
        description: 'Example of registering a new customer',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
          phoneNumber: '+1234567890',
          role: 'customer',
          dateOfBirth: '1990-05-15',
          shippingAddress: '123 Main St, Apt 4B, New York, NY 10001, USA',
          marketingOptIn: true
        }
      },
      admin: {
        summary: 'Admin User Creation',
        description: 'Example of creating an admin user (requires admin privileges)',
        value: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'AdminPass123!',
          role: 'admin'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'User account created successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, validation errors, or email already exists',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (when creating admin/moderator accounts)',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieves a paginated list of users. Requires admin or moderator privileges.',
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
    description: 'Number of users per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term to filter users by name or email',
    example: 'john',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['customer', 'admin', 'moderator'],
    description: 'Filter users by role',
    example: 'customer',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter users by active status',
    example: true,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['firstName', 'lastName', 'email', 'createdAt', 'lastLoginAt'],
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
    example: 'desc',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 250 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 25 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - admin or moderator role required',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{ data: UserResponseDto[]; meta: any }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the profile information of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  getProfile(): Promise<UserResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a single user by their unique identifier. Users can only access their own profile unless they have admin/moderator privileges.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'User found and returned successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - can only access own profile or requires admin/moderator role',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Updates the profile information of the currently authenticated user.',
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: CreateUserDto,
    description: 'User profile data for update (partial update supported)',
    examples: {
      basicUpdate: {
        summary: 'Update Basic Information',
        description: 'Example of updating basic user information',
        value: {
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+1987654321'
        }
      },
      addressUpdate: {
        summary: 'Update Addresses',
        description: 'Example of updating user addresses',
        value: {
          shippingAddress: '456 Oak Ave, Suite 200, Los Angeles, CA 90210, USA',
          billingAddress: '789 Pine St, Unit 5, Chicago, IL 60601, USA'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'User profile updated successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  updateProfile(@Body() updateUserDto: Partial<CreateUserDto>): Promise<UserResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user by ID',
    description: 'Updates a user account. Requires admin privileges or the user updating their own account.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID to update',
    example: 1,
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: CreateUserDto,
    description: 'User data for update (partial update supported)',
    examples: {
      roleUpdate: {
        summary: 'Update User Role (Admin Only)',
        description: 'Example of updating user role - requires admin privileges',
        value: {
          role: 'moderator'
        }
      },
      statusUpdate: {
        summary: 'Update Account Status (Admin Only)',
        description: 'Example of activating/deactivating user account',
        value: {
          isActive: false
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - can only update own account or requires admin role',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ): Promise<UserResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Deletes a user account. Requires admin privileges. This is a soft delete - the account will be deactivated.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID to delete',
    example: 1,
  })
  @ApiOkResponse({
    description: 'User account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User account deleted successfully' },
        deletedId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - admin role required',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; deletedId: number }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get(':id/orders')
  @ApiOperation({
    summary: 'Get user orders',
    description: 'Retrieves all orders for a specific user. Users can only access their own orders unless they have admin/moderator privileges.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User ID',
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
    description: 'Number of orders per page',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    description: 'Filter orders by status',
    example: 'delivered',
  })
  @ApiOkResponse({
    description: 'User orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderResponseDto' },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 15 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 2 },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid user ID format or query parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - can only access own orders or requires admin/moderator role',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  getUserOrders(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ): Promise<{ data: any[]; meta: any }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }
}
