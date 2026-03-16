import { ProductEntity } from '@modules/products/entities/product.entity';
import { Promotion } from '@modules/promotions/entities/promotions.entity';
import { Exclude } from 'class-transformer';
import { UploadApiResponse } from 'cloudinary';
import { Entity, Column, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('images')
export class CloudinaryImageEntity {
  @PrimaryColumn()
  public_id: string;

  @Column()
  @Exclude()
  asset_id: string;

  @Column()
  url: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @OneToOne(() => ProductEntity, (product) => product.image, { nullable: true, onDelete: 'CASCADE' })
  product?: ProductEntity;

  @OneToOne(() => Promotion, (promotion) => promotion.image, { nullable: true, onDelete: 'CASCADE' })
  promotion?: Promotion;

  constructor(entity: Partial<UploadApiResponse>) {
    if (!entity) {
      return;
    }

    this.public_id = entity.public_id || '';
    this.asset_id = entity.asset_id || '';
    this.url = entity.secure_url || '';
    this.width = entity.width || 0;
    this.height = entity.height || 0;
  }
}
