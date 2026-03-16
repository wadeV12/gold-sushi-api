import { OrdersController } from '@modules/orders/orders.controller';
import { ProductEntity } from '@modules/products/entities/product.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { OrderDetailEntity } from '@modules/orders/entities/order-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderDetailEntity, ProductEntity]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {
}
