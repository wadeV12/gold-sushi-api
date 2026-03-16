import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Cart } from './cart.entity';
import { ProductEntity } from '@modules/products/entities/product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => ProductEntity, { eager: true, onDelete: 'RESTRICT' })
  product: ProductEntity;

  @Column('int', { default: 1 })
  quantity: number;
}
