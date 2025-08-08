import { BaseEntity } from '../../../common/entities/base.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class Order extends BaseEntity {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  orderNumber: string;

  constructor(partial: Partial<Order> = {}) {
    super();
    Object.assign(this, partial);
    this.status = partial.status ?? OrderStatus.PENDING;
    this.items = partial.items ?? [];
    this.totalAmount = partial.totalAmount ?? 0;
  }

  calculateTotal(): void {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }
}