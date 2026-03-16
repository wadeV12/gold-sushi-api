import { ProductStatus } from '@modules/products/entities/product.entity';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  price: number;

  @IsOptional()
  @IsString()
  description: string;

  image: any;

  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  weight: number;

  @IsOptional()
  categoryId?: string;

  @IsOptional()
  status?: ProductStatus;
}
