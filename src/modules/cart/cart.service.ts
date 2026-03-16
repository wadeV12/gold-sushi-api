import { Cart } from '@modules/cart/entities/cart.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
  ) {
  }

  createCart() {
    const cart = this.cartRepository.create();
    return this.cartRepository.save(cart);
  }

  getCart(id: string) {
    return this.cartRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
  }

  addToCart(cartId: string, productId: string, quantity: number) {}
}
