import { CloudinaryService } from '@common/cloudinary/cloudinary.service';
import { ProductEntity } from '@modules/products/entities/product.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PromotionsController from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { Promotion } from './entities/promotions.entity';
import { Promocode } from './entities/promocode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, Promocode, ProductEntity])],
  controllers: [PromotionsController],
  providers: [PromotionsService, CloudinaryService],
})
export class PromotionsModule {}
