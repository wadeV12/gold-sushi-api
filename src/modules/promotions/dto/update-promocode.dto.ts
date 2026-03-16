import {
  IsString,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer'

export class UpdatePromocodeDto {
  @IsString()
  @IsOptional()
  code: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  discount: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  applyToCart: boolean;

  @IsDateString()
  @IsOptional()
  expiryDate: Date;
}
