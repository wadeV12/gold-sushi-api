import { CreateOrderDTO } from '@modules/orders/dto/create-order.dto';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { ProductEntity } from '@modules/products/entities/product.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity) private readonly ordersRepo: Repository<OrderEntity>,
    @InjectRepository(ProductEntity) private productRepository: Repository<ProductEntity>,
  ) {}


  async createOrder(userId: string, order: CreateOrderDTO) {
    const newOrder = this.ordersRepo.create(order);
    const productIds = order.items.map(item => item.productId);

    const products = await this.productRepository.find({ where: { id: In(productIds) } });

    newOrder.total = products.reduce((sum, product) => {
      const item = order.items.find((i) => i.productId === product.id);
      return sum + product.price * (item.quantity || 0);
    }, 0);

    newOrder.user = { id: userId } as any; // Assuming you have a UserEntity and a relation set up

    newOrder.items = order.items.map(item => {
      const product = products.find(p => p.id === item.productId);

      return {
        product,
        price: product.price,
        quantity: item.quantity,
      };
    })

    return await this.ordersRepo.save(newOrder);
  }

  updateOrderStatus() {

  }

  getAllOrders() {
    const page = 1;
    const limit = 10;
    return this.ordersRepo.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  getOrder(id: string) {
    return this.ordersRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });
  }
}
