import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import { CartItem } from '@modules/cart/entities/cart-item.entity';
import { Cart } from '@modules/cart/entities/cart.entity';
import { Promocode } from '@modules/promotions/entities/promocode.entity';
import { Promotion } from '@modules/promotions/entities/promotions.entity';
import { AddressEntity } from '@modules/users/entities/address.entity';
import { DataSource } from 'typeorm';
import { UserEntity } from '@modules/users/entities/user.entity';
import { Category } from '@modules/category/entities/category.entity';
import { ProductEntity } from '@modules/products/entities/product.entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'ddx_user',
  password: 'ddx_password',
  database: 'goldsushi_db',
  schema: 'public',
  entities: [
    AddressEntity,
    Category,
    ProductEntity,
    UserEntity,
    Promotion,
    Promocode,
    CloudinaryImageEntity,
    Cart,
    CartItem,
  ],
  synchronize: true,
});

export const databaseProviders = {
  provide: 'DATA_SOURCE',
  useFactory: async () => {
    return await dataSource.initialize();
  },
};
