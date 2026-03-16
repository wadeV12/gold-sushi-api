import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';

export class CreateOrderItemDTO {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
