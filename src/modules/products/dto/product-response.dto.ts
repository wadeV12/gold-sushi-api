import { ProductStatus } from '@modules/products/entities/product.entity';
import { Exclude, Expose, Type } from 'class-transformer';
import { CategoryResponseDto } from '@modules/category/dto/category-response.dto';

@Exclude()
export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto;

  @Expose()
  title: string;

  @Expose()
  price: number;

  @Expose()
  description: number;

  @Expose()
  image: string;

  @Expose()
  weight: number;

  @Expose()
  measureType: string;

  @Expose()
  status: ProductStatus;
}
