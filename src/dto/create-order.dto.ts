import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsArray, IsOptional, IsString, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  productId: number;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
    maximum: 999,
  })
  @IsNumber()
  @Min(1)
  @Max(999)
  quantity: number;

  @ApiProperty({
    description: 'Price per unit at the time of order (in cents)',
    example: 9999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Customer user ID',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  userId: number;

  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
    example: [
      {
        productId: 1,
        quantity: 2,
        unitPrice: 9999
      },
      {
        productId: 3,
        quantity: 1,
        unitPrice: 4999
      }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main St, Apt 4B, New York, NY 10001, USA',
    maxLength: 500,
  })
  @IsString()
  shippingAddress: string;

  @ApiProperty({
    description: 'Billing address for the order (if different from shipping)',
    example: '456 Oak Ave, Suite 200, Los Angeles, CA 90210, USA',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  billingAddress?: string;

  @ApiProperty({
    description: 'Payment method for the order',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Special instructions or notes for the order',
    example: 'Please leave at the front door if no one is home',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Coupon code applied to the order',
    example: 'SAVE10',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({
    description: 'Shipping method preference',
    example: 'standard',
    enum: ['standard', 'express', 'overnight'],
    default: 'standard',
    required: false,
  })
  @IsOptional()
  @IsEnum(['standard', 'express', 'overnight'])
  shippingMethod?: string;
}
