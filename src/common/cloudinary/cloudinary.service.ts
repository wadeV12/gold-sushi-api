import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File, folder: string, options: UploadApiOptions = {}): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder, ...options },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      ).end(file?.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    return cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        throw new Error(`Failed to delete image: ${error.message}`);
      }
      return result;
    })
  }
}
