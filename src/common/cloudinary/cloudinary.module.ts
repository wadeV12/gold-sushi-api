import { Module } from '@nestjs/common';
import { CloudinaryProvider } from '@common/cloudinary/cloduinary.provider';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';

@Module({
  providers: [CloudinaryService, CloudinaryProvider],
  exports: [CloudinaryService, CloudinaryProvider],
})
export class CloudinaryModule {}
