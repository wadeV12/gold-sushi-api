import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('promocodes')
export class Promocode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  discount: number; // Discount percentage or fixed amount

  @Column({ default: false })
  applyToCart: boolean; // True for cart-wide, false for individual products

  @Column({ type: 'timestamp' })
  expiryDate: Date;
}
