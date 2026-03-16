import { CartService } from '@modules/cart/cart.service';
import { Controller, Get, Param, Post } from '@nestjs/common';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {
  }

  @Post()
  async create(): Promise<any> {
    return this.cartService.createCart();
  }

  @Get(':id')
  async getCart(@Param('id') id: string): Promise<any> {
    return this.cartService.getCart(id);
  }

  @Post(':id/add')
  async addToCart(): Promise<any> {
    return { message: 'Item added to cart' };
  }
}
