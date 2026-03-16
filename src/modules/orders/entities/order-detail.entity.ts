import { OrderEntity } from '@modules/orders/entities/order.entity';
import { ProductEntity } from '@modules/products/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('orderDetail')
export class OrderDetailEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order?: OrderEntity;

  @ManyToOne(() => ProductEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product?: ProductEntity;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
