import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import { ProductEntity } from '@modules/products/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @OneToOne(() => CloudinaryImageEntity, { eager: true, cascade: true, nullable: true })
  @JoinColumn()
  thumbnail: CloudinaryImageEntity;

  @OneToMany(() => ProductEntity, (product) => product.category, {
    cascade: true,
    onDelete: 'SET NULL',
    nullable: true
  })
  products: ProductEntity[];
}
