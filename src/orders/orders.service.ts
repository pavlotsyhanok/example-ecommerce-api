import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CreateOrderDto, OrderStatus, PaymentMethod } from '../dto/create-order.dto';
import { OrderResponseDto, OrderItemResponseDto } from '../dto/order-response.dto';

@Injectable()
export class OrdersService {
  private orders: OrderResponseDto[] = [
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      userId: 1,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      status: OrderStatus.DELIVERED,
      items: [
        {
          id: 1,
          productId: 1,
          productName: 'Wireless Bluetooth Headphones',
          productSku: 'WBH-001-BLK',
          quantity: 2,
          unitPrice: 9999,
          formattedUnitPrice: '$99.99',
          totalPrice: 19998,
          formattedTotalPrice: '$199.98',
          productImage: 'https://example.com/images/headphones-1.jpg',
        },
      ],
      subtotal: 19998,
      formattedSubtotal: '$199.98',
      taxAmount: 1600,
      formattedTaxAmount: '$16.00',
      shippingCost: 999,
      formattedShippingCost: '$9.99',
      discountAmount: 0,
      formattedDiscountAmount: '$0.00',
      totalAmount: 22597,
      formattedTotalAmount: '$225.97',
      shippingAddress: '123 Main St, Apt 4B, New York, NY 10001, USA',
      billingAddress: '123 Main St, Apt 4B, New York, NY 10001, USA',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: 'paid',
      notes: 'Please leave at the front door if no one is home',
      couponCode: null,
      shippingMethod: 'standard',
      trackingNumber: 'TRK123456789',
      estimatedDeliveryDate: '2024-01-25',
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-22T14:45:00Z',
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      userId: 2,
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      status: OrderStatus.SHIPPED,
      items: [
        {
          id: 2,
          productId: 2,
          productName: 'Gaming Mechanical Keyboard',
          productSku: 'GMK-002-RGB',
          quantity: 1,
          unitPrice: 12999,
          formattedUnitPrice: '$129.99',
          totalPrice: 12999,
          formattedTotalPrice: '$129.99',
          productImage: 'https://example.com/images/keyboard-1.jpg',
        },
        {
          id: 3,
          productId: 3,
          productName: 'Smartphone Case',
          productSku: 'SPC-003-BLU',
          quantity: 2,
          unitPrice: 2499,
          formattedUnitPrice: '$24.99',
          totalPrice: 4998,
          formattedTotalPrice: '$49.98',
          productImage: 'https://example.com/images/case-1.jpg',
        },
      ],
      subtotal: 17997,
      formattedSubtotal: '$179.97',
      taxAmount: 1440,
      formattedTaxAmount: '$14.40',
      shippingCost: 1499,
      formattedShippingCost: '$14.99',
      discountAmount: 500,
      formattedDiscountAmount: '$5.00',
      totalAmount: 19436,
      formattedTotalAmount: '$194.36',
      shippingAddress: '456 Oak Ave, Suite 200, Los Angeles, CA 90210, USA',
      billingAddress: null,
      paymentMethod: PaymentMethod.PAYPAL,
      paymentStatus: 'paid',
      notes: null,
      couponCode: 'SAVE5',
      shippingMethod: 'express',
      trackingNumber: 'TRK987654321',
      estimatedDeliveryDate: '2024-01-24',
      createdAt: '2024-01-18T15:20:00Z',
      updatedAt: '2024-01-21T09:15:00Z',
    },
    {
      id: 3,
      orderNumber: 'ORD-2024-003',
      userId: 1,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      status: OrderStatus.PENDING,
      items: [
        {
          id: 4,
          productId: 4,
          productName: 'Wireless Mouse',
          productSku: 'WM-004-WHT',
          quantity: 1,
          unitPrice: 4999,
          formattedUnitPrice: '$49.99',
          totalPrice: 4999,
          formattedTotalPrice: '$49.99',
          productImage: 'https://example.com/images/mouse-1.jpg',
        },
      ],
      subtotal: 4999,
      formattedSubtotal: '$49.99',
      taxAmount: 400,
      formattedTaxAmount: '$4.00',
      shippingCost: 999,
      formattedShippingCost: '$9.99',
      discountAmount: 0,
      formattedDiscountAmount: '$0.00',
      totalAmount: 6398,
      formattedTotalAmount: '$63.98',
      shippingAddress: '123 Main St, Apt 4B, New York, NY 10001, USA',
      billingAddress: null,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentStatus: 'pending',
      notes: null,
      couponCode: null,
      shippingMethod: 'standard',
      trackingNumber: null,
      estimatedDeliveryDate: null,
      createdAt: '2024-01-22T11:45:00Z',
      updatedAt: '2024-01-22T11:45:00Z',
    },
  ];

  private nextId = 4;
  private nextItemId = 5;

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Validate order items
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Calculate totals
    const subtotal = createOrderDto.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = Math.round(subtotal * taxRate);
    
    // Calculate shipping cost based on method
    const shippingCosts = {
      standard: 999,
      express: 1499,
      overnight: 2999,
    };
    const shippingCost = shippingCosts[createOrderDto.shippingMethod || 'standard'];

    // Apply discount if coupon code is provided
    let discountAmount = 0;
    if (createOrderDto.couponCode) {
      discountAmount = this.calculateDiscount(createOrderDto.couponCode, subtotal);
    }

    const totalAmount = subtotal + taxAmount + shippingCost - discountAmount;

    // Create order items
    const orderItems: OrderItemResponseDto[] = createOrderDto.items.map(item => ({
      id: this.nextItemId++,
      productId: item.productId,
      productName: this.getProductName(item.productId),
      productSku: this.getProductSku(item.productId),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      formattedUnitPrice: this.formatPrice(item.unitPrice),
      totalPrice: item.unitPrice * item.quantity,
      formattedTotalPrice: this.formatPrice(item.unitPrice * item.quantity),
      productImage: this.getProductImage(item.productId),
    }));

    const newOrder: OrderResponseDto = {
      id: this.nextId++,
      orderNumber: this.generateOrderNumber(),
      userId: createOrderDto.userId,
      customerName: this.getCustomerName(createOrderDto.userId),
      customerEmail: this.getCustomerEmail(createOrderDto.userId),
      status: OrderStatus.PENDING,
      items: orderItems,
      subtotal,
      formattedSubtotal: this.formatPrice(subtotal),
      taxAmount,
      formattedTaxAmount: this.formatPrice(taxAmount),
      shippingCost,
      formattedShippingCost: this.formatPrice(shippingCost),
      discountAmount,
      formattedDiscountAmount: this.formatPrice(discountAmount),
      totalAmount,
      formattedTotalAmount: this.formatPrice(totalAmount),
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress || null,
      paymentMethod: createOrderDto.paymentMethod,
      paymentStatus: 'pending',
      notes: createOrderDto.notes || null,
      couponCode: createOrderDto.couponCode || null,
      shippingMethod: createOrderDto.shippingMethod || 'standard',
      trackingNumber: null,
      estimatedDeliveryDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.push(newOrder);
    return newOrder;
  }

  async findAll(filters: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }, currentUserId?: number, userRole?: string): Promise<{ data: OrderResponseDto[]; meta: any }> {
    let filteredOrders = [...this.orders];

    // If not admin/moderator, only show user's own orders
    if (userRole !== 'admin' && userRole !== 'moderator' && currentUserId) {
      filteredOrders = filteredOrders.filter(o => o.userId === currentUserId);
    }

    // Apply filters
    if (filters.status) {
      filteredOrders = filteredOrders.filter(o => o.status === filters.status);
    }

    if (filters.userId && (userRole === 'admin' || userRole === 'moderator')) {
      filteredOrders = filteredOrders.filter(o => o.userId === filters.userId);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) <= toDate);
    }

    if (filters.minAmount) {
      filteredOrders = filteredOrders.filter(o => o.totalAmount >= filters.minAmount);
    }

    if (filters.maxAmount) {
      filteredOrders = filteredOrders.filter(o => o.totalAmount <= filters.maxAmount);
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredOrders.sort((a, b) => {
        let aValue = a[filters.sortBy];
        let bValue = b[filters.sortBy];

        if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (filters.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      data: paginatedOrders,
      meta: {
        total: filteredOrders.length,
        page,
        limit,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    };
  }

  async findOne(id: number, currentUserId?: number, userRole?: string): Promise<OrderResponseDto> {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'moderator' && order.userId !== currentUserId) {
      throw new ForbiddenException('You can only access your own orders');
    }

    return order;
  }

  async updateStatus(
    id: number,
    statusData: { status: string; trackingNumber?: string; notes?: string },
    currentUserId?: number,
    userRole?: string
  ): Promise<OrderResponseDto> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = this.orders[orderIndex];

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'moderator') {
      // Customers can only cancel pending orders
      if (statusData.status !== OrderStatus.CANCELLED || order.status !== OrderStatus.PENDING) {
        throw new ForbiddenException('Insufficient permissions for this status change');
      }
      if (order.userId !== currentUserId) {
        throw new ForbiddenException('You can only modify your own orders');
      }
    }

    // Validate status transition
    if (!this.isValidStatusTransition(order.status, statusData.status as OrderStatus)) {
      throw new BadRequestException(`Invalid status transition from ${order.status} to ${statusData.status}`);
    }

    // Update order
    this.orders[orderIndex] = {
      ...order,
      status: statusData.status as OrderStatus,
      trackingNumber: statusData.trackingNumber || order.trackingNumber,
      notes: statusData.notes || order.notes,
      estimatedDeliveryDate: statusData.status === OrderStatus.SHIPPED ? this.calculateEstimatedDelivery(order.shippingMethod) : order.estimatedDeliveryDate,
      updatedAt: new Date().toISOString(),
    };

    return this.orders[orderIndex];
  }

  async update(
    id: number,
    updateOrderDto: Partial<CreateOrderDto>,
    currentUserId?: number,
    userRole?: string
  ): Promise<OrderResponseDto> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = this.orders[orderIndex];

    // Check permissions
    if (userRole !== 'admin' && order.userId !== currentUserId) {
      throw new ForbiddenException('You can only modify your own orders');
    }

    // Only allow updates for pending orders
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be modified');
    }

    // Update allowed fields
    const updatedOrder: OrderResponseDto = {
      ...order,
      shippingAddress: updateOrderDto.shippingAddress || order.shippingAddress,
      billingAddress: updateOrderDto.billingAddress !== undefined ? updateOrderDto.billingAddress : order.billingAddress,
      notes: updateOrderDto.notes !== undefined ? updateOrderDto.notes : order.notes,
      shippingMethod: updateOrderDto.shippingMethod || order.shippingMethod,
      updatedAt: new Date().toISOString(),
    };

    this.orders[orderIndex] = updatedOrder;
    return updatedOrder;
  }

  async remove(id: number, currentUserId?: number, userRole?: string): Promise<{ message: string; cancelledId: number }> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const order = this.orders[orderIndex];

    // Check permissions
    if (userRole !== 'admin' && order.userId !== currentUserId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    // Only allow cancellation of pending orders
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    // Cancel order (soft delete)
    this.orders[orderIndex] = {
      ...order,
      status: OrderStatus.CANCELLED,
      updatedAt: new Date().toISOString(),
    };

    return {
      message: 'Order cancelled successfully',
      cancelledId: id,
    };
  }

  async getInvoice(id: number, currentUserId?: number, userRole?: string): Promise<any> {
    const order = await this.findOne(id, currentUserId, userRole);

    return {
      invoiceNumber: `INV-${order.orderNumber.replace('ORD-', '')}`,
      order,
      generatedAt: new Date().toISOString(),
      downloadUrl: `/api/orders/${id}/invoice/download`,
    };
  }

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const orderCount = this.orders.length + 1;
    return `ORD-${year}-${orderCount.toString().padStart(3, '0')}`;
  }

  private calculateDiscount(couponCode: string, subtotal: number): number {
    const coupons = {
      'SAVE5': 500, // $5 off
      'SAVE10': 1000, // $10 off
      'PERCENT10': Math.round(subtotal * 0.1), // 10% off
    };
    return coupons[couponCode] || 0;
  }

  private calculateEstimatedDelivery(shippingMethod: string): string {
    const today = new Date();
    const deliveryDays = {
      standard: 5,
      express: 2,
      overnight: 1,
    };
    const days = deliveryDays[shippingMethod] || 5;
    const deliveryDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    return deliveryDate.toISOString().split('T')[0];
  }

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private formatPrice(priceInCents: number): string {
    return `$${(priceInCents / 100).toFixed(2)}`;
  }

  private getProductName(productId: number): string {
    const products = {
      1: 'Wireless Bluetooth Headphones',
      2: 'Gaming Mechanical Keyboard',
      3: 'Smartphone Case',
      4: 'Wireless Mouse',
    };
    return products[productId] || 'Unknown Product';
  }

  private getProductSku(productId: number): string {
    const skus = {
      1: 'WBH-001-BLK',
      2: 'GMK-002-RGB',
      3: 'SPC-003-BLU',
      4: 'WM-004-WHT',
    };
    return skus[productId] || 'UNKNOWN-SKU';
  }

  private getProductImage(productId: number): string | null {
    const images = {
      1: 'https://example.com/images/headphones-1.jpg',
      2: 'https://example.com/images/keyboard-1.jpg',
      3: 'https://example.com/images/case-1.jpg',
      4: 'https://example.com/images/mouse-1.jpg',
    };
    return images[productId] || null;
  }

  private getCustomerName(userId: number): string {
    const customers = {
      1: 'John Doe',
      2: 'Jane Smith',
      3: 'Admin User',
      4: 'Mike Johnson',
    };
    return customers[userId] || 'Unknown Customer';
  }

  private getCustomerEmail(userId: number): string {
    const emails = {
      1: 'john.doe@example.com',
      2: 'jane.smith@example.com',
      3: 'admin@example.com',
      4: 'mike.johnson@example.com',
    };
    return emails[userId] || 'unknown@example.com';
  }
}
