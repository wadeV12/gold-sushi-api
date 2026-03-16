import { CloudinaryFolders } from '#types/cloudinary';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';
import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import { UpdatePromocodeDto } from '@modules/promotions/dto/update-promocode.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotions.entity';
import { Promocode } from './entities/promocode.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { CreatePromoCodeDto } from './dto/create-promocode.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(Promocode)
    private readonly promoCodeRepository: Repository<Promocode>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createPromotion(dto: CreatePromotionDto) {
    const promotion = this.promotionRepository.create(dto);
    return this.promotionRepository.save(promotion);
  }

  async getAllPromotions(): Promise<Promotion[]> {
    return this.promotionRepository.find();
  }

  async getPromotionById(id: string): Promise<Promotion> {
    return this.promotionRepository.findOne({ where: { id } });
  }

  async deletePromotion(id: string): Promise<void> {
    await this.promotionRepository.delete(id);
  }

  async updatePromotion(id: string, dto: CreatePromotionDto, file: Express.Multer.File): Promise<Promotion> {
    const existingPromotion = await this.promotionRepository.findOne({ where: { id } });

    if (!existingPromotion) {
      throw new NotFoundException();
    }

    const promotion = plainToInstance(Promotion, dto);

    if (file) {
      if (existingPromotion.image) {
        await this.cloudinaryService.deleteImage(existingPromotion.image.public_id);
      }

      const image = await this.cloudinaryService.uploadImage(file, CloudinaryFolders.PRODUCTS);
      promotion.image = new CloudinaryImageEntity(image);
    }

    try {
      await this.promotionRepository.update(id, dto);
    } catch (error) {
      throw new BadRequestException('Error updating promotion');
    }

    return promotion;
  }

  async createPromoCode(dto: CreatePromoCodeDto): Promise<Promocode> {
    const promoCode = this.promoCodeRepository.create(dto);
    return this.promoCodeRepository.save(promoCode);
  }

  async getAllPromoCodes(): Promise<Promocode[]> {
    return this.promoCodeRepository.find();
  }

  async updatePromoCode(id: string, dto: UpdatePromocodeDto): Promise<Promocode> {
    const existingPromoCode = await this.promoCodeRepository.findOneBy({ id });

    if (!existingPromoCode) {
      throw new NotFoundException();
    }

    await this.promoCodeRepository.update(id, dto);

    return this.promoCodeRepository.findOneBy({ id });
  }

  async getPromoCode(id: string): Promise<Promocode> {
    return this.promoCodeRepository.findOneBy({ id });
  }

  async deletePromoCode(id: string): Promise<void> {
    await this.promoCodeRepository.delete(id);
  }
}
