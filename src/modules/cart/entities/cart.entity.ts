import { Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true, eager: true, nullable: true })
  items: CartItem[];

  @CreateDateColumn()
  createdAt: Date;
}
