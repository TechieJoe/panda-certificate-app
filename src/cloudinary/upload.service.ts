import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.config';
import { Readable } from 'stream';

@Injectable()
export class UploadService {

  async uploadBuffer(file: Express.Multer.File): Promise<string> {

    // 🔥 safety size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image too large');
    }

    return new Promise((resolve, reject) => {

     const upload = cloudinary.uploader.upload_stream(
  {
    folder: 'certificates',

    resource_type: 'image',

    quality: 'auto',
    fetch_format: 'auto',

    transformation: [
      {
        width: 1000,
        height: 1000,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto',
      },
    ],

    timeout: 60000,
  },

        (error, result) => {

          if (error) {
            console.error('Cloudinary error:', error);
            return reject(error);
          }

          resolve(result?.secure_url || '');
        },
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }
}