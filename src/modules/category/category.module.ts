import { CloudinaryModule } from '@common/cloudinary/cloudinary.module';
import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import { ProductEntity } from '@modules/products/entities/product.entity';
import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, ProductEntity, CloudinaryImageEntity]),
    CloudinaryModule
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
