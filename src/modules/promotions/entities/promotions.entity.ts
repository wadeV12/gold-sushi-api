import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToOne(() => CloudinaryImageEntity, { eager: true, cascade: true })
  @JoinColumn()
  image: CloudinaryImageEntity;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ nullable: true })
  category: string; // Optional: Apply to a category
}
