import { Injectable, NotFoundException } from '@nestjs/common';
import { Cart, CartItem } from './cart.interface';
import { DatabaseService } from './database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CartService {
  private carts: Map<string, Cart> = new Map();

  constructor(private readonly databaseService: DatabaseService) {}

  createCart(): Cart {
    const cartId = uuidv4();
    const newCart: Cart = {
      id: cartId,
      items: [],
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.carts.set(cartId, newCart);
    return newCart;
  }

  getCart(cartId: string): Cart {
    const cart = this.carts.get(cartId);
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }
    return cart;
  }

  addToCart(cartId: string, productId: number, quantity: number): Cart {
    const cart = this.getCart(cartId);
    const product = this.databaseService.getProductById(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.id === productId,
    );

    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        product,
        quantity,
      };
      cart.items.push(newItem);
    }

    // Update cart total and timestamp
    this.updateCartTotals(cart);

    return cart;
  }

  updateCartItem(cartId: string, productId: number, quantity: number): Cart {
    const cart = this.getCart(cartId);

    const itemIndex = cart.items.findIndex(
      (item) => item.product.id === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in cart`,
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Update cart total and timestamp
    this.updateCartTotals(cart);

    return cart;
  }

  removeFromCart(cartId: string, productId: number): Cart {
    const cart = this.getCart(cartId);

    const itemIndex = cart.items.findIndex(
      (item) => item.product.id === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in cart`,
      );
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    // Update cart total and timestamp
    this.updateCartTotals(cart);

    return cart;
  }

  clearCart(cartId: string): Cart {
    const cart = this.getCart(cartId);

    cart.items = [];

    // Update cart total and timestamp
    this.updateCartTotals(cart);

    return cart;
  }

  deleteCart(cartId: string): void {
    if (!this.carts.has(cartId)) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    this.carts.delete(cartId);
  }

  private updateCartTotals(cart: Cart): void {
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    cart.updatedAt = new Date();
  }
}
