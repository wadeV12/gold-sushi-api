import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  thumbnail: any;

  @IsOptional()
  @IsArray()
  productIds?: string[];
}
