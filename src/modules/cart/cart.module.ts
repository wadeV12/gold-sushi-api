import { CartController } from '@modules/cart/cart.controller';
import { CartItem } from '@modules/cart/entities/cart-item.entity';
import { Cart } from '@modules/cart/entities/cart.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '../../database/database.module';
import { CartService } from './cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    DatabaseModule,
  ],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {
}
