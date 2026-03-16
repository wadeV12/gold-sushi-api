import { Transform } from 'class-transformer';
import { IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  image?: Express.Multer.File;

  @IsOptional()
  weight?: number;

  @IsOptional()
  categoryId?: string;
}
