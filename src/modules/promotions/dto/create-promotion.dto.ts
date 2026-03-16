import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator';
import { UploadApiResponse } from 'cloudinary';

export class CreatePromotionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  image: any;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  // @IsArray()
  // @IsOptional()
  // productIds?: number[];

  @IsString()
  @IsOptional()
  category?: string;
}
