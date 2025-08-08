import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './cart.interface';

interface AddToCartDto {
  productId: number;
  quantity: number;
}

interface UpdateCartItemDto {
  quantity: number;
}

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  createCart(): Cart {
    return this.cartService.createCart();
  }

  @Get(':id')
  getCart(@Param('id') id: string): Cart {
    return this.cartService.getCart(id);
  }

  @Post(':id/items')
  addToCart(
    @Param('id') id: string,
    @Body() addToCartDto: AddToCartDto,
  ): Cart {
    return this.cartService.addToCart(
      id,
      addToCartDto.productId,
      addToCartDto.quantity,
    );
  }

  @Put(':id/items/:productId')
  updateCartItem(
    @Param('id') id: string,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Cart {
    return this.cartService.updateCartItem(
      id,
      parseInt(productId, 10),
      updateCartItemDto.quantity,
    );
  }

  @Delete(':id/items/:productId')
  removeFromCart(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ): Cart {
    return this.cartService.removeFromCart(id, parseInt(productId, 10));
  }

  @Delete(':id/items')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(@Param('id') id: string): void {
    this.cartService.clearCart(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCart(@Param('id') id: string): void {
    this.cartService.deleteCart(id);
  }
}