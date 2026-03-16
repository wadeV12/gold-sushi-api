import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { CreateOrderItemDTO } from './create-order-item.dto';
import { DeliveryType, PaymentType } from '@common/enums/Order';

export class CreateOrderDTO {
  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @IsOptional()
  @IsDateString()
  deliveryScheduleTime?: string;

  @IsOptional()
  @IsDateString()
  deliveryTime?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDTO)
  items: CreateOrderItemDTO[];
}
