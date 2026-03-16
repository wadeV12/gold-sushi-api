import { IsString, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer'

export class CreatePromoCodeDto {
  @IsString()
  code: string;

  @Type(() => Number)
  @IsNumber()
  discount: number;

  @Type(() => Boolean)
  @IsBoolean()
  applyToCart: boolean;

  @IsDateString()
  expiryDate: Date;
}
