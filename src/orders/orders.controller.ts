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
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';

@ApiTags('orders')
@Controller('orders')
@ApiProduces('application/json')
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description: 'Creates a new order for the authenticated user. Validates product availability and calculates totals.',
  })
  @ApiConsumes('application/json')
  @ApiBody({
    type: CreateOrderDto,
    description: 'Order data for creation',
    examples: {
      singleItem: {
        summary: 'Single Item Order',
        description: 'Example of creating an order with one product',
        value: {
          userId: 1,
          items: [
            {
              productId: 1,
              quantity: 2,
              unitPrice: 9999
            }
          ],
          shippingAddress: '123 Main St, Apt 4B, New York, NY 10001, USA',
          paymentMethod: 'credit_card',
          notes: 'Please leave at the front door if no one is home',
          shippingMethod: 'standard'
        }
      },
      multipleItems: {
        summary: 'Multiple Items Order',
        description: 'Example of creating an order with multiple products',
        value: {
          userId: 1,
          items: [
            {
              productId: 1,
              quantity: 1,
              unitPrice: 9999
            },
            {
              productId: 3,
              quantity: 2,
              unitPrice: 4999
            }
          ],
          shippingAddress: '123 Main St, Apt 4B, New York, NY 10001, USA',
          billingAddress: '456 Oak Ave, Suite 200, Los Angeles, CA 90210, USA',
          paymentMethod: 'paypal',
          couponCode: 'SAVE10',
          shippingMethod: 'express'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data, insufficient stock, or validation errors',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'User cannot create orders for other users (unless admin)',
  })
  create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get()
  @ApiOperation({
    summary: 'Get all orders',
    description: 'Retrieves a paginated list of orders. Regular users see only their orders, admins/moderators see all orders.',
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
    description: 'Number of orders per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    description: 'Filter orders by status',
    example: 'confirmed',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: Number,
    description: 'Filter orders by user ID (admin/moderator only)',
    example: 1,
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    type: String,
    description: 'Filter orders from this date (YYYY-MM-DD)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    type: String,
    description: 'Filter orders to this date (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiQuery({
    name: 'minAmount',
    required: false,
    type: Number,
    description: 'Filter orders with minimum total amount (in cents)',
    example: 5000,
  })
  @ApiQuery({
    name: 'maxAmount',
    required: false,
    type: Number,
    description: 'Filter orders with maximum total amount (in cents)',
    example: 50000,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'updatedAt', 'totalAmount', 'status'],
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
    description: 'Orders retrieved successfully',
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
            total: { type: 'number', example: 75 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 8 },
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
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('userId') userId?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('minAmount') minAmount?: number,
    @Query('maxAmount') maxAmount?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{ data: OrderResponseDto[]; meta: any }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get('my-orders')
  @ApiOperation({
    summary: 'Get current user orders',
    description: 'Retrieves all orders for the currently authenticated user.',
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
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
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
    description: 'Invalid query parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  getMyOrders(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ): Promise<{ data: OrderResponseDto[]; meta: any }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieves a single order by its unique identifier. Users can only access their own orders unless they have admin/moderator privileges.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Order ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Order found and returned successfully',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid order ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - can only access own orders or requires admin/moderator role',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update order status',
    description: 'Updates the status of an order. Customers can cancel pending orders, admins/moderators can update any status.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Order ID to update',
    example: 1,
  })
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Order status update data',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
          example: 'shipped'
        },
        trackingNumber: {
          type: 'string',
          description: 'Tracking number (required when status is shipped)',
          example: 'TRK123456789'
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the status change',
          example: 'Package shipped via FedEx'
        }
      },
      required: ['status']
    },
    examples: {
      shipped: {
        summary: 'Mark as Shipped',
        description: 'Example of updating order status to shipped',
        value: {
          status: 'shipped',
          trackingNumber: 'TRK123456789',
          notes: 'Package shipped via FedEx'
        }
      },
      cancelled: {
        summary: 'Cancel Order',
        description: 'Example of cancelling an order',
        value: {
          status: 'cancelled',
          notes: 'Cancelled by customer request'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Order status updated successfully',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid status transition or missing required fields',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions for this status change',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { status: string; trackingNumber?: string; notes?: string },
  ): Promise<OrderResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update order details',
    description: 'Updates order details such as shipping address or notes. Only allowed for pending orders.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Order ID to update',
    example: 1,
  })
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Order update data (partial update supported)',
    schema: {
      type: 'object',
      properties: {
        shippingAddress: {
          type: 'string',
          example: '456 New Address St, Apt 2A, Boston, MA 02101, USA'
        },
        billingAddress: {
          type: 'string',
          example: '789 Billing Ave, Suite 100, Seattle, WA 98101, USA'
        },
        notes: {
          type: 'string',
          example: 'Updated delivery instructions'
        },
        shippingMethod: {
          type: 'string',
          enum: ['standard', 'express', 'overnight'],
          example: 'express'
        }
      }
    },
    examples: {
      addressUpdate: {
        summary: 'Update Addresses',
        description: 'Example of updating order addresses',
        value: {
          shippingAddress: '456 New Address St, Apt 2A, Boston, MA 02101, USA',
          billingAddress: '789 Billing Ave, Suite 100, Seattle, WA 98101, USA'
        }
      }
    }
  })
  @ApiOkResponse({
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or order cannot be modified',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - can only update own orders or requires admin role',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: Partial<CreateOrderDto>,
  ): Promise<OrderResponseDto> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel/Delete order',
    description: 'Cancels an order. Only pending orders can be cancelled. Requires admin privileges for hard deletion.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Order ID to cancel/delete',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Order cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Order cancelled successfully' },
        cancelledId: { type: 'number', example: 1 },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid order ID format or order cannot be cancelled',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - can only cancel own orders or requires admin role',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string; cancelledId: number }> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }

  @Get(':id/invoice')
  @ApiOperation({
    summary: 'Get order invoice',
    description: 'Generates and retrieves the invoice for a specific order. Users can only access invoices for their own orders.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Order ID',
    example: 1,
  })
  @ApiOkResponse({
    description: 'Invoice generated successfully',
    schema: {
      type: 'object',
      properties: {
        invoiceNumber: { type: 'string', example: 'INV-2024-001' },
        order: { $ref: '#/components/schemas/OrderResponseDto' },
        generatedAt: { type: 'string', format: 'date-time', example: '2024-01-20T15:30:00Z' },
        downloadUrl: { type: 'string', example: '/api/orders/1/invoice/download' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid order ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions - can only access own order invoices',
  })
  @ApiNotFoundResponse({
    description: 'Order not found',
  })
  getInvoice(@Param('id', ParseIntPipe) id: number): Promise<any> {
    // Implementation will be added in the service layer
    throw new Error('Method not implemented.');
  }
}
