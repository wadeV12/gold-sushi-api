import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import { CartItem } from '@modules/cart/entities/cart-item.entity';
import { Cart } from '@modules/cart/entities/cart.entity';
import { OrderDetailEntity } from '@modules/orders/entities/order-detail.entity';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { Promocode } from '@modules/promotions/entities/promocode.entity';
import { Promotion } from '@modules/promotions/entities/promotions.entity';
import { AddressEntity } from '@modules/users/entities/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Category } from '@modules/category/entities/category.entity';
import { ProductEntity } from '@modules/products/entities/product.entity';

export const pgDataSource = TypeOrmModule.forRootAsync({
  useFactory: (configService: ConfigService) => {
    return {
      type: 'postgres',
      host: configService.get('DB_HOST'),
      password: configService.get('DB_PASSWORD'),
      username: configService.get('DB_USERNAME'),
      database: configService.get('DB_DATABASE'),
      ssl: true,
      entities: [
        AddressEntity,
        UserEntity,
        Category,
        ProductEntity,
        Promocode,
        Promotion,
        CloudinaryImageEntity,
        Cart,
        CartItem,
        OrderEntity,
        OrderDetailEntity
      ],
      synchronize: true,
      logging: ['error'],
    }
  },
  inject: [ConfigService],
});
