import { CloudinaryFolders } from '#types/cloudinary';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';
import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import { CategoryResponseDto } from '@modules/category/dto/category-response.dto';
import { ProductEntity } from '@modules/products/entities/product.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { shortId } from '@common/utils/shortId';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CloudinaryImageEntity) private imageRepository: Repository<CloudinaryImageEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create({
      id: shortId(),
      ...createCategoryDto
    });

    const { productIds } = createCategoryDto;

    if (productIds?.length > 0) {
      category.products = await this.productRepository.findByIds(productIds);
    }

    return this.categoryRepository.save(category);
  }

  async addThumbnail(categoryId: string, file: Express.Multer.File): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });

    if (!category) {
      throw new Error('Category not found');
    }

    const existingThumbnail = category.thumbnail;

    if (existingThumbnail) {
      await this.cloudinaryService.deleteImage(existingThumbnail.public_id);
      await this.imageRepository.delete(existingThumbnail.public_id);
    }

    let thumbnail;

    try {
      thumbnail = await this.cloudinaryService.uploadImage(
        file,
        CloudinaryFolders.PRODUCTS,
        { transformation: [{ width: 256, height: 256 } ] }
      );
    } catch (e) {
      throw new BadRequestException(`Error uploading image: ${e.message}`);
    }

    const thumbnailEntity = new CloudinaryImageEntity(thumbnail);

    category.thumbnail = thumbnailEntity;

    await this.imageRepository.save(thumbnailEntity);
    await this.categoryRepository.save(category);

    return category;
  }

  async getMenu(): Promise<Category[]> {
    const limit = 6;

    const categories = await this.categoryRepository.find({
      relations: ['products'],
      // Only categories with products
      where: { products: { id: Not(IsNull()) } },
    });

    categories.forEach(category => {
      category.products = category.products.slice(0, limit);
    });

    return categories;
  }

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find();

    return plainToInstance(CategoryResponseDto, categories);
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    await this.categoryRepository.update(id, updateCategoryDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
