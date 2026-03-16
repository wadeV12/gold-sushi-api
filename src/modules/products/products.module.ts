import { CloudinaryModule } from '@common/cloudinary/cloudinary.module';
import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import { Category } from '@modules/category/entities/category.entity';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, Category, CloudinaryImageEntity]),
    DatabaseModule,
    CloudinaryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
