import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { BcryptModule } from '../../utils/bcrypt/bcrypt.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { OrderEntity } from '@modules/orders/entities/order.entity';
import { ProductEntity } from '@modules/products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OrderEntity, ProductEntity]),
    BcryptModule,
    JwtModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
