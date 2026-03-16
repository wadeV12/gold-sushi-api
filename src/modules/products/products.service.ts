import { CloudinaryFolders } from '#types/cloudinary';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';
import { CloudinaryImageEntity } from '@common/cloudinary/entities/image.entity';
import { Category } from '@modules/category/entities/category.entity';
import { UpdateProductDto } from '@modules/products/dto/update-product.dto';
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadApiResponse } from 'cloudinary';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { plainToInstance } from 'class-transformer';
import { ProductResponseDto } from './dto/product-response.dto';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(ProductEntity) private productRepository: Repository<ProductEntity>,
    @InjectRepository(CloudinaryImageEntity) private imageRepository: Repository<CloudinaryImageEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {
  }

  async create(product: CreateProductDto, file: Express.Multer.File): Promise<ProductResponseDto> {
    let image: UploadApiResponse;
    const productEntity = new ProductEntity(product);

    try {
      image = await this.cloudinaryService.uploadImage(file, CloudinaryFolders.PRODUCTS);
    } catch (e) {
      throw new BadRequestException(`Error uploading image: ${e.message}`);
    }

    const imageEntity = new CloudinaryImageEntity(image);

    productEntity.image = imageEntity;

    if (product.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: product.categoryId });

      if (!category) {
        throw new BadRequestException(`Category with id ${product.categoryId} not found`);
      }

      productEntity.category = category;
    }

    try {
      await this.productRepository.save(productEntity);
      await this.imageRepository.save(imageEntity);
    } catch (e) {
      throw new BadRequestException(`Error creating product: ${e.message}`);
    }

    return plainToInstance(ProductResponseDto, productEntity);
  }

  async update(id: string, productDto: UpdateProductDto, file: Express.Multer.File): Promise<any> {
    const existingProduct = await this.productRepository.findOne({ where: { id } });

    if (!existingProduct) {
      throw new BadRequestException(`Item with id ${id} not found`);
    }

    const product = plainToInstance(ProductEntity, productDto);

    if (file) {
      await this.cloudinaryService.deleteImage(existingProduct.image.public_id);
      const image = await this.cloudinaryService.uploadImage(file, CloudinaryFolders.PRODUCTS);
      product.image = new CloudinaryImageEntity(image);
    }

    if (productDto.categoryId) {
      const category = await this.categoryRepository.findOneBy({
        id: productDto.categoryId,
      });

      if (!category) {
        throw new BadRequestException(
          `Category with id ${productDto.categoryId} not found`,
        );
      }

      product.category = category;
    }

    this.productRepository.merge(existingProduct, product);

    try {
      await this.productRepository.save(existingProduct);
    } catch (e) {
      throw new BadRequestException(`Error updating item: ${e.message}`);
    }

    return plainToInstance(ProductResponseDto, existingProduct);
  }

  async delete(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new BadRequestException(`Item with id ${id} not found`);
    }

    try {
      await this.cloudinaryService.deleteImage(product.image.public_id);
      await this.productRepository.delete(id);
    } catch (e) {
      throw new BadRequestException(`Error deleting item: ${e.message}`);
    }
  }

  async getAll(): Promise<ProductResponseDto[]> {
    const items = await this.productRepository.find({
      relations: ['category'],
    });

    return plainToInstance(ProductResponseDto, items);
  }

  async getAllUnassigned(): Promise<ProductResponseDto[]> {
    const items = await this.productRepository.find({
      where: { 'category' : IsNull() },
    });

    return plainToInstance(ProductResponseDto, items);
  }

  async getById(id: string): Promise<ProductResponseDto> {
    const item = await this.productRepository.findOne({
      relations: ['category'],
      where: { id }
    });
    return plainToInstance(ProductResponseDto, item);
  }

  async getRecommendedProducts(id: string, limit: number = 6): Promise<ProductResponseDto[]> {
    const items = await this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.image', 'image')
      .where('product.id != :id', { id })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();

    return plainToInstance(ProductResponseDto, items);
  }
}
