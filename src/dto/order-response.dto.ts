import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentMethod } from './create-order.dto';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order item ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  productId: number;

  @ApiProperty({
    description: 'Product name at the time of order',
    example: 'Wireless Bluetooth Headphones',
  })
  productName: string;

  @ApiProperty({
    description: 'Product SKU at the time of order',
    example: 'WBH-001-BLK',
  })
  productSku: string;

  @ApiProperty({
    description: 'Quantity of the product ordered',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Price per unit at the time of order (in cents)',
    example: 9999,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Formatted price per unit for display',
    example: '$99.99',
  })
  formattedUnitPrice: string;

  @ApiProperty({
    description: 'Total price for this item (quantity × unit price) in cents',
    example: 19998,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Formatted total price for this item',
    example: '$199.98',
  })
  formattedTotalPrice: string;

  @ApiProperty({
    description: 'Product image URL at the time of order',
    example: 'https://example.com/images/headphones-1.jpg',
    nullable: true,
  })
  productImage: string | null;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the order',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Human-readable order number',
    example: 'ORD-2024-001',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'Customer user ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
  })
  customerName: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'john.doe@example.com',
  })
  customerEmail: string;

  @ApiProperty({
    description: 'Current status of the order',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];

  @ApiProperty({
    description: 'Subtotal amount (sum of all items) in cents',
    example: 24997,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Formatted subtotal for display',
    example: '$249.97',
  })
  formattedSubtotal: string;

  @ApiProperty({
    description: 'Tax amount in cents',
    example: 2000,
  })
  taxAmount: number;

  @ApiProperty({
    description: 'Formatted tax amount for display',
    example: '$20.00',
  })
  formattedTaxAmount: string;

  @ApiProperty({
    description: 'Shipping cost in cents',
    example: 999,
  })
  shippingCost: number;

  @ApiProperty({
    description: 'Formatted shipping cost for display',
    example: '$9.99',
  })
  formattedShippingCost: string;

  @ApiProperty({
    description: 'Discount amount applied in cents',
    example: 500,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Formatted discount amount for display',
    example: '$5.00',
  })
  formattedDiscountAmount: string;

  @ApiProperty({
    description: 'Total order amount in cents',
    example: 27496,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Formatted total amount for display',
    example: '$274.96',
  })
  formattedTotalAmount: string;

  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main St, Apt 4B, New York, NY 10001, USA',
  })
  shippingAddress: string;

  @ApiProperty({
    description: 'Billing address for the order',
    example: '456 Oak Ave, Suite 200, Los Angeles, CA 90210, USA',
    nullable: true,
  })
  billingAddress: string | null;

  @ApiProperty({
    description: 'Payment method used for the order',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment status of the order',
    enum: ['pending', 'paid', 'failed', 'refunded'],
    example: 'paid',
  })
  paymentStatus: string;

  @ApiProperty({
    description: 'Special instructions or notes for the order',
    example: 'Please leave at the front door if no one is home',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({
    description: 'Coupon code applied to the order',
    example: 'SAVE10',
    nullable: true,
  })
  couponCode: string | null;

  @ApiProperty({
    description: 'Shipping method used',
    example: 'standard',
  })
  shippingMethod: string;

  @ApiProperty({
    description: 'Tracking number for shipped orders',
    example: 'TRK123456789',
    nullable: true,
  })
  trackingNumber: string | null;

  @ApiProperty({
    description: 'Estimated delivery date',
    example: '2024-01-25',
    format: 'date',
    nullable: true,
  })
  estimatedDeliveryDate: string | null;

  @ApiProperty({
    description: 'Date when the order was placed',
    example: '2024-01-20T10:30:00Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Date when the order was last updated',
    example: '2024-01-20T14:45:00Z',
    format: 'date-time',
  })
  updatedAt: string;
}
