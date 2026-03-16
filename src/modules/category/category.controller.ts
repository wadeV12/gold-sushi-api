import { CategoryResponseDto } from '@modules/category/dto/category-response.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('menu')
  getMenu() {
    return this.categoryService.getMenu();
  }

  @Post('category')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const category = await this.categoryService.create(createCategoryDto);

    return {
      ...category,
      url: `/category/${category.slug}-${category.id}`,
    };
  }

  @Get('category/list')
  findAll(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll() as any;
  }

  @Get('category/:id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Post('category/:id/thumbnail')
  @UseInterceptors(FileInterceptor('image'))
  addThumbnail(@Param('id') id: string, @UploadedFile() file: Express.Multer.File,) {
    return this.categoryService.addThumbnail(id, file);
  }

  @Patch('category/:id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete('category/:id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
