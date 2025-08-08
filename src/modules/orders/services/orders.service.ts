import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus, OrderItem } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderDto } from '../dto';
import { ProductsService } from '../../products/services/products.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class OrdersService {
  private orders: Order[] = [];

  constructor(
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orders;
  }

  async findOne(id: string): Promise<Order> {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orders.filter(o => o.userId === userId);
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate user exists
    await this.usersService.findOne(createOrderDto.userId);

    // Validate products and calculate order items
    const orderItems: OrderItem[] = [];
    
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        );
      }

      const orderItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity,
      };

      orderItems.push(orderItem);

      // Update product stock
      await this.productsService.updateStock(product.id, -item.quantity);
    }

    const order = new Order({
      id: uuidv4(),
      userId: createOrderDto.userId,
      items: orderItems,
      shippingAddress: createOrderDto.shippingAddress,
      orderNumber: this.generateOrderNumber(),
    });

    order.calculateTotal();
    this.orders.push(order);
    
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const orderIndex = this.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const existingOrder = this.orders[orderIndex];
    
    // Validate status transition
    if (updateOrderDto.status) {
      this.validateStatusTransition(existingOrder.status, updateOrderDto.status);
    }

    const updatedOrder = new Order({
      ...existingOrder,
      ...updateOrderDto,
    });
    updatedOrder.updateTimestamp();

    this.orders[orderIndex] = updatedOrder;
    return updatedOrder;
  }

  async cancel(id: string): Promise<Order> {
    const order = await this.findOne(id);
    
    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    // Restore product stock
    for (const item of order.items) {
      await this.productsService.updateStock(item.productId, item.quantity);
    }

    return this.update(id, { status: OrderStatus.CANCELLED });
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}